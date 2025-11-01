interface DuplicateInfo {
  value: string | number | boolean;
  count: number;
  locations: Array<{ key: string; index?: number }>;
}

export const findDuplicateValues = (data: any): Map<string | number | boolean, DuplicateInfo> => {
  const valueMap = new Map<string | number | boolean, DuplicateInfo>();
  
  const traverse = (obj: any, path: string = '', index?: number) => {
    if (obj === null || obj === undefined) {
      return;
    }
    
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        traverse(item, path ? `${path}[${i}]` : `[${i}]`, i);
      });
    } else if (typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Only track primitive values (skip null, undefined, objects, arrays)
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          if (!valueMap.has(value)) {
            valueMap.set(value, { value, count: 0, locations: [] });
          }
          valueMap.get(value)!.count++;
          valueMap.get(value)!.locations.push({ key: currentPath, index });
        } else if (typeof value === 'object' && value !== null) {
          // Recursively traverse objects and arrays
          traverse(value, currentPath, index);
        }
      });
    } else if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      // Primitive value at root
      if (!valueMap.has(obj)) {
        valueMap.set(obj, { value: obj, count: 0, locations: [] });
      }
      valueMap.get(obj)!.count++;
      valueMap.get(obj)!.locations.push({ key: path || 'root', index });
    }
  };
  
  traverse(data);
  
  // Filter to only return values that appear more than once
  const duplicates = new Map<string | number | boolean, DuplicateInfo>();
  valueMap.forEach((info, value) => {
    if (info.count > 1) {
      duplicates.set(value, info);
    }
  });
  
  return duplicates;
};

export const highlightDuplicatesInContent = (
  content: string,
  duplicates: Map<string | number | boolean, DuplicateInfo>
): string => {
  let highlightedContent = content;
  
  // Sort by value length (longest first) to avoid partial matches
  const sortedDuplicates = Array.from(duplicates.entries())
    .sort(([a], [b]) => String(b).length - String(a).length);
  
  sortedDuplicates.forEach(([value, info]) => {
    const valueStr = String(value);
    // Escape special regex characters
    const escapedValue = valueStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create regex that matches the value but not if it's already inside a highlight span
    const regex = new RegExp(`(?<!<mark[^>]*>)(${escapedValue})(?!</mark>)`, 'g');
    
    // Replace with highlighted version
    highlightedContent = highlightedContent.replace(
      regex,
      `<mark class="duplicate-value" data-count="${info.count}" title="Appears ${info.count} times">$1</mark>`
    );
  });
  
  return highlightedContent;
};

