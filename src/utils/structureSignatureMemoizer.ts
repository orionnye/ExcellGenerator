/**
 * Memoized structure signature computation
 * Caches structure signatures to avoid redundant calculations for large datasets
 */

// Use WeakMap to allow garbage collection of cached entries when objects are no longer referenced
// For primitive values and arrays, we use a regular Map with string keys
const objectCache = new WeakMap<object, string>();
const primitiveCache = new Map<string, string>();

/**
 * Gets the structural signature of an object (sorted keys) with memoization
 * 
 * @param obj - The object to get the structure signature for
 * @returns The structure signature string
 */
export const getMemoizedStructureSignature = (obj: any): string => {
  if (obj === null || obj === undefined) {
    return '';
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    // Check cache first
    if (objectCache.has(obj)) {
      return objectCache.get(obj)!;
    }
    
    if (obj.length === 0) {
      const signature = '[]';
      objectCache.set(obj, signature);
      return signature;
    }
    
    // For arrays, signature includes length and first item structure
    const firstItemSig = getMemoizedStructureSignature(obj[0]);
    const signature = `[${obj.length}]:${firstItemSig}`;
    objectCache.set(obj, signature);
    return signature;
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    // Check cache first
    if (objectCache.has(obj)) {
      return objectCache.get(obj)!;
    }
    
    const keys = Object.keys(obj).sort();
    const signature = keys.join('|');
    objectCache.set(obj, signature);
    return signature;
  }
  
  // Handle primitives (cache by type)
  const typeKey = `primitive:${typeof obj}`;
  if (primitiveCache.has(typeKey)) {
    return primitiveCache.get(typeKey)!;
  }
  
  const signature = typeof obj;
  primitiveCache.set(typeKey, signature);
  return signature;
};

/**
 * Clears the structure signature cache
 * Useful for testing or when memory needs to be freed
 */
export const clearStructureSignatureCache = (): void => {
  // WeakMap entries are automatically garbage collected, but we can't manually clear them
  // Clear the primitive cache
  primitiveCache.clear();
  
  // Note: WeakMap doesn't have a clear() method, entries are GC'd automatically
  // If we need to force clear, we'd need to track references, but that defeats the purpose
};

