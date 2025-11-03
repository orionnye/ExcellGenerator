/**
 * Gets a value from JSON data by path
 * Supports paths like "0", "1.items", "2.items[0]", "root.user.profile"
 */
export const getValueByPath = (data: any, path: string): any => {
  if (!path || path === 'root') {
    return data;
  }
  
  const parts = path.split(/[\.\[\]]+/).filter(p => p !== '');
  let current = data;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    if (Array.isArray(current)) {
      const index = parseInt(part, 10);
      if (isNaN(index) || index < 0 || index >= current.length) {
        return undefined;
      }
      current = current[index];
    } else if (typeof current === 'object') {
      current = current[part];
    } else {
      return undefined;
    }
  }
  
  return current;
};

/**
 * Checks if a path is valid for the given data
 */
export const isValidPath = (data: any, path: string): boolean => {
  return getValueByPath(data, path) !== undefined;
};

