/**
 * Detects structures at all depths with path tracking
 */

export interface StructurePathInfo {
  path: string; // e.g., "0", "0.items", "1.items[0]", "root.user.profile"
  structure: string; // Sorted keys string representation
  isFirstOfType: boolean; // Whether this is the first of its type
  isDuplicate: boolean; // Whether this structure appears multiple times
}

/**
 * Gets the structural signature of an object (sorted keys)
 */
const getStructureSignature = (obj: any): string => {
  if (obj === null || obj === undefined) {
    return '';
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return '[]';
    }
    return `[${obj.length}]:${getStructureSignature(obj[0])}`;
  }
  
  if (typeof obj === 'object') {
    const keys = Object.keys(obj).sort();
    return keys.join('|');
  }
  
  return typeof obj;
};

/**
 * Detects all structures at all depths with their paths
 */
export const detectStructuresWithPaths = (
  data: any,
  basePath: string = ''
): StructurePathInfo[] => {
  const results: StructurePathInfo[] = [];
  const structureGroups = new Map<string, StructurePathInfo[]>();
  
  const traverse = (obj: any, path: string): void => {
    if (obj === null || obj === undefined) {
      return;
    }
    
    // Only track objects and arrays
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const itemPath = path ? `${path}[${index}]` : `[${index}]`;
        
        if (typeof item === 'object' && item !== null) {
          const structure = getStructureSignature(item);
          
          if (!structureGroups.has(structure)) {
            structureGroups.set(structure, []);
          }
          structureGroups.get(structure)!.push({
            path: itemPath,
            structure,
            isFirstOfType: false,
            isDuplicate: false,
          });
        }
        
        // Recursively traverse nested structures
        traverse(item, itemPath);
      });
    } else if (typeof obj === 'object') {
      // Check if this object has a structure worth tracking
      const structure = getStructureSignature(obj);
      
      if (structure && structure !== '[]') {
        if (!structureGroups.has(structure)) {
          structureGroups.set(structure, []);
        }
        structureGroups.get(structure)!.push({
          path,
          structure,
          isFirstOfType: false,
          isDuplicate: false,
        });
      }
      
      // Recursively traverse nested structures
      Object.entries(obj).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        traverse(value, newPath);
      });
    }
  };
  
  // Handle root level
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const itemPath = index.toString();
      if (typeof item === 'object' && item !== null) {
        traverse(item, itemPath);
      } else {
        traverse(item, itemPath);
      }
    });
  } else if (typeof data === 'object' && data !== null) {
    traverse(data, basePath || 'root');
  }
  
  // Mark first of each type and duplicates
  structureGroups.forEach((paths) => {
    if (paths.length > 0) {
      paths[0].isFirstOfType = true;
      paths[0].isDuplicate = paths.length > 1;
      for (let i = 1; i < paths.length; i++) {
        paths[i].isDuplicate = true;
      }
    }
  });
  
  // Flatten results
  structureGroups.forEach((paths) => {
    results.push(...paths);
  });
  
  return results;
};

