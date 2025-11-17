/**
 * Common wrapper property names that typically contain the meaningful data
 */
const COMMON_WRAPPER_PATTERNS = ['value', 'data', 'result', 'payload', 'content', 'body'];

/**
 * Detects if an object has a wrapper pattern and returns the property name containing the data
 * 
 * Detection rules:
 * 1. Object has multiple properties
 * 2. One property is an object or array (the data)
 * 3. Other properties are primitives/metadata
 * 4. If multiple nested object/array properties exist, prefer common wrapper patterns
 * 5. If only one nested object/array property exists, use it
 * 
 * @param obj - The object to analyze
 * @returns Property name if wrapper pattern detected, null otherwise
 */
export const detectWrapperProperty = (obj: any): string | null => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return null;
  }

  const keys = Object.keys(obj);
  
  if (keys.length === 0) {
    return null;
  }

  // Find all properties that are objects or arrays
  const nestedProperties: Array<{ key: string; isCommon: boolean }> = [];
  // Count primitive/metadata properties (not objects/arrays)
  let primitiveCount = 0;
  
  for (const key of keys) {
    const value = obj[key];
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' || Array.isArray(value)) {
        const isCommon = COMMON_WRAPPER_PATTERNS.includes(key);
        nestedProperties.push({ key, isCommon });
      } else {
        primitiveCount++;
      }
    }
  }

  if (nestedProperties.length === 0) {
    // No nested properties - not a wrapper
    return null;
  }

  if (nestedProperties.length === 1) {
    // Single nested property
    const singleNested = nestedProperties[0];
    if (primitiveCount > 0 && singleNested.isCommon) {
      // Has metadata (primitives) AND nested property matches common pattern - wrapper
      return singleNested.key;
    }
    // Either no primitives or doesn't match common pattern - not a wrapper
    return null;
  }

  // Multiple nested properties - check for common wrapper patterns
  const commonWrappers = nestedProperties.filter(p => p.isCommon);
  
  if (commonWrappers.length === 1) {
    // Only one common pattern - use it (even without primitives, pattern is clear)
    return commonWrappers[0].key;
  }
  
  if (commonWrappers.length > 1) {
    // Multiple common patterns - ambiguous
    return null;
  }

  // Multiple nested properties but none match common patterns
  if (primitiveCount > 0) {
    // Has metadata - might be wrapper but ambiguous which property
    return null;
  }
  
  // No primitives, multiple nested properties, none match patterns - not a wrapper
  return null;
};

/**
 * Extracts data from wrapper object if pattern is detected, otherwise returns original object
 * 
 * @param obj - The object to extract from
 * @returns Extracted nested data if wrapper pattern detected, original object otherwise
 */
export const extractWrapperData = (obj: any): any => {
  const wrapperProperty = detectWrapperProperty(obj);
  
  if (wrapperProperty) {
    return obj[wrapperProperty];
  }
  
  return obj;
};

