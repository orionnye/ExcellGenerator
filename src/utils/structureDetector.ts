/**
 * Detects duplicate object structures in JSON data
 * Groups objects by their field structure (ignoring values)
 */

export interface StructureInfo {
  structure: string; // Sorted keys string representation
  firstIndex: number; // Index of first occurrence
  indices: number[]; // All indices with this structure
  isFirst: boolean; // Whether this is the first of its type
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
    // For arrays, return a signature based on array length and structure of first element
    if (obj.length === 0) {
      return '[]';
    }
    return `[${obj.length}]:${getStructureSignature(obj[0])}`;
  }
  
  if (typeof obj === 'object') {
    // For objects, return sorted keys
    const keys = Object.keys(obj).sort();
    return keys.join('|');
  }
  
  // For primitives, return type
  return typeof obj;
};

/**
 * Detects duplicate structures in JSON data
 * @param data - The JSON data (array or object)
 * @returns Array of StructureInfo for each element
 */
export const detectDuplicateStructures = (data: any): StructureInfo[] => {
  const results: StructureInfo[] = [];
  
  // Handle different data structures
  let items: any[] = [];
  
  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === 'object' && data !== null) {
    items = [data];
  } else {
    // Not a structure we can analyze
    return results;
  }
  
  // Group items by structure
  const structureMap = new Map<string, number[]>(); // structure -> indices[]
  
  items.forEach((item, index) => {
    const structure = getStructureSignature(item);
    
    if (!structureMap.has(structure)) {
      structureMap.set(structure, []);
    }
    structureMap.get(structure)!.push(index);
  });
  
  // Build results
  const isFirstOfStructure = new Set<number>();
  
  structureMap.forEach((indices, structure) => {
    // Mark first occurrence as "first of its type"
    isFirstOfStructure.add(indices[0]);
  });
  
  items.forEach((item, index) => {
    const structure = getStructureSignature(item);
    const indices = structureMap.get(structure) || [];
    const firstIndex = indices[0];
    const isDuplicate = indices.length > 1;
    const isFirst = firstIndex === index;
    
    results.push({
      structure,
      firstIndex,
      indices,
      isFirst,
      isDuplicate,
    });
  });
  
  return results;
};

/**
 * Highlights unique structures in JSON content
 * Wraps the first occurrence of each unique structure type
 */
export const highlightUniqueStructures = (
  content: string,
  structures: StructureInfo[]
): React.ReactNode[] => {
  if (structures.length === 0) {
    return [content];
  }
  
  // We need to parse and re-render the JSON with highlighting
  // For now, return the content as-is and let the component handle rendering
  return [content];
};

