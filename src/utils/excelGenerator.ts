export interface ExcelPreviewData {
  headers: string[];
  rows: Array<Array<string | number>>;
}

/**
 * Checks if all objects in an array have the same structure (same keys)
 */
const hasSameStructure = (arr: any[]): boolean => {
  if (arr.length === 0) return true;
  
  const firstKeys = Object.keys(arr[0]).sort();
  return arr.every(item => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      return false;
    }
    const itemKeys = Object.keys(item).sort();
    return itemKeys.length === firstKeys.length && 
           itemKeys.every((key, i) => key === firstKeys[i]);
  });
};

/**
 * Expands a row that contains arrays of same-structure objects into multiple rows
 * @param row - The flattened row object
 * @returns Array of row objects (one per array item)
 */
const expandArraysInRow = (row: Record<string, any>): Array<Record<string, any>> => {
  // Find all keys that might be from arrays of same-structure objects
  // (keys without [index] that appear multiple times would indicate this)
  // For now, we'll detect arrays by checking if we have multiple values for the same base key
  
  // Group keys by their base path (without [index])
  const baseKeys = new Map<string, Array<{ key: string; value: any }>>();
  
  for (const [key, value] of Object.entries(row)) {
    // Remove [index] from key to get base path
    const baseKey = key.replace(/\[\d+\]/g, '');
    if (!baseKeys.has(baseKey)) {
      baseKeys.set(baseKey, []);
    }
    baseKeys.get(baseKey)!.push({ key, value });
  }
  
  // Check if any base key has multiple entries (indicating array expansion needed)
  const arraysToExpand: Array<{ baseKey: string; items: Array<{ key: string; value: any }> }> = [];
  baseKeys.forEach((items, baseKey) => {
    if (items.length > 1) {
      arraysToExpand.push({ baseKey, items });
    }
  });
  
  // If no arrays to expand, return single row
  if (arraysToExpand.length === 0) {
    return [row];
  }
  
  // Find the maximum number of items (this determines row count)
  const maxItems = Math.max(...arraysToExpand.map(a => a.items.length));
  const expandedRows: Array<Record<string, any>> = [];
  
  // Create a row for each index
  for (let i = 0; i < maxItems; i++) {
    const expandedRow: Record<string, any> = { ...row };
    
    // For each array, use the value at index i (if it exists)
    arraysToExpand.forEach(({ baseKey, items }) => {
      // Remove all indexed keys for this base key
      items.forEach(({ key }) => {
        delete expandedRow[key];
      });
      
      // Add the value at index i if it exists
      if (i < items.length) {
        const { key, value } = items[i];
        // Use base key instead of indexed key
        expandedRow[baseKey] = value;
      }
    });
    
    expandedRows.push(expandedRow);
  }
  
  return expandedRows;
};

/**
 * Generates Excel preview data from parsed JSON data
 * @param data - The parsed JSON data (array or object)
 * @returns ExcelPreviewData with headers and rows, or null if invalid
 */
export const generateExcelFromJsonData = (data: any): ExcelPreviewData | null => {
  try {
    // Handle different JSON structures
    let rows: any[];
    
    if (Array.isArray(data)) {
      // If data is an array, use it directly
      rows = data;
    } else if (typeof data === 'object' && data !== null) {
      // If data is a single object, wrap it in an array
      rows = [data];
    } else {
      // Invalid JSON structure
      return null;
    }
    
    if (rows.length === 0) {
      return { headers: [], rows: [] };
    }
    
    // Flatten objects and collect all possible keys
    const allKeys = new Set<string>();
    const flattenedRows: Array<Record<string, any>> = [];
    
    rows.forEach((row, index) => {
      const flattened = flattenObject(row);
      flattenedRows.push(flattened);
      Object.keys(flattened).forEach(key => allKeys.add(key));
    });
    
    // Expand arrays of same-structure objects into multiple rows
    const expandedRows: Array<Record<string, any>> = [];
    flattenedRows.forEach(row => {
      const expanded = expandArraysInRow(row);
      expandedRows.push(...expanded);
    });
    
    // Re-collect keys after expansion (base keys without [index] will be used)
    const finalKeys = new Set<string>();
    expandedRows.forEach(row => {
      Object.keys(row).forEach(key => finalKeys.add(key));
    });
    
    // Convert Set to sorted Array for consistent column order
    const headers = Array.from(finalKeys).sort();
    
    // Map rows to arrays with consistent column order
    const excelRows: Array<Array<string | number>> = expandedRows.map(row => {
      return headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        // Convert to string or number based on type
        return typeof value === 'number' ? value : String(value);
      });
    });
    
    return {
      headers,
      rows: excelRows,
    };
  } catch (error) {
    console.error('Error generating Excel from JSON:', error);
    return null;
  }
};

/**
 * Legacy function - generates Excel preview data from JSON text
 * @param jsonText - The JSON content as a string
 * @returns ExcelPreviewData with headers and rows, or null if parsing fails
 * @deprecated Use generateExcelFromJsonData with parsed data instead
 */
export const generateExcelFromJson = (jsonText: string): ExcelPreviewData | null => {
  try {
    const data = JSON.parse(jsonText);
    return generateExcelFromJsonData(data);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

/**
 * Flattens a nested object into a flat key-value structure
 * @param obj - The object to flatten
 * @param prefix - Optional prefix for nested keys
 * @returns Flattened object
 */
const flattenObject = (obj: any, prefix: string = ''): Record<string, any> => {
  const flattened: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      
      if (value === null || value === undefined) {
        flattened[newKey] = value;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        // Handle arrays
        if (value.length === 0) {
          flattened[newKey] = '';
        } else {
          // Check if array contains objects - if so, expand them
          const firstItem = value[0];
          if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
            // Array of objects - check if they have the same structure
            if (hasSameStructure(value)) {
              // Same structure: use indexed keys temporarily, will be expanded later
              // This allows us to detect arrays and expand them into rows
              value.forEach((item, index) => {
                const indexedKey = `${newKey}[${index}]`;
                Object.assign(flattened, flattenObject(item, indexedKey));
              });
            } else {
              // Different structures - expand into indexed columns
              value.forEach((item, index) => {
                const indexedKey = `${newKey}[${index}]`;
                Object.assign(flattened, flattenObject(item, indexedKey));
              });
            }
          } else {
            // Array of primitives - join them
            flattened[newKey] = value.join(', ');
          }
        }
      } else {
        // Primitive value
        flattened[newKey] = value;
      }
    }
  }
  
  return flattened;
};

