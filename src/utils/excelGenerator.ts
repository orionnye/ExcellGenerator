export interface ExcelPreviewData {
  headers: string[];
  rows: Array<Array<string | number>>;
}

/**
 * Generates Excel preview data from JSON text
 * @param jsonText - The JSON content as a string
 * @returns ExcelPreviewData with headers and rows, or null if parsing fails
 */
export const generateExcelFromJson = (jsonText: string): ExcelPreviewData | null => {
  try {
    // Parse the JSON text
    const data = JSON.parse(jsonText);
    
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
    
    // Convert Set to sorted Array for consistent column order
    const headers = Array.from(allKeys).sort();
    
    // Map rows to arrays with consistent column order
    const excelRows: Array<Array<string | number>> = flattenedRows.map(row => {
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
            // Array of objects - expand into indexed columns
            value.forEach((item, index) => {
              const indexedKey = `${newKey}[${index}]`;
              Object.assign(flattened, flattenObject(item, indexedKey));
            });
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

