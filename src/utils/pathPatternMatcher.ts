/**
 * Path pattern matching utilities
 * Supports matching relative paths across all objects (e.g., "heartRateZones[1]")
 */

/**
 * Extracts a relative path pattern from a full path
 * Example: "0.heartRateZones[1]" -> "heartRateZones[1]"
 * Example: "1.user.profile" -> "user.profile"
 * Example: "0" -> "0"
 * Example: "[0]" -> "[0]"
 */
export const extractRelativePath = (fullPath: string): string => {
  // Remove leading numeric indices (top-level array indices)
  // Split by both dots and brackets
  const segments: string[] = [];
  let current = '';
  
  for (let i = 0; i < fullPath.length; i++) {
    const char = fullPath[i];
    if (char === '.' || char === '[') {
      if (current) {
        segments.push(current);
        current = '';
      }
      if (char === '[') {
        // Extract bracket part like "[1]"
        const bracketMatch = fullPath.substring(i).match(/^\[\d+\]/);
        if (bracketMatch) {
          segments.push(bracketMatch[0]);
          i += bracketMatch[0].length - 1;
          continue;
        }
      }
      segments.push(char);
    } else {
      current += char;
    }
  }
  if (current) {
    segments.push(current);
  }
  
  // Find first non-numeric segment
  let startIndex = 0;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    // Check if segment is just a number (array index at top level)
    if (!isNaN(Number(segment)) && segment[0] !== '[' && segment !== '.') {
      startIndex = i + 1;
    } else {
      break;
    }
  }
  
  // Reconstruct relative path
  if (startIndex >= segments.length) {
    // All segments were numeric, return as-is or extract array notation
    if (fullPath.includes('[')) {
      const match = fullPath.match(/\[\d+\]/);
      return match ? match[0] : fullPath;
    }
    return fullPath;
  }
  
  // Join remaining segments, handling dots and brackets properly
  const relative = segments.slice(startIndex).join('');
  // Clean up leading dots
  return relative.replace(/^\.+/, '');
};

/**
 * Checks if a full path matches a relative pattern
 * Example: matches("0.heartRateZones[1]", "heartRateZones[1]") -> true
 * Example: matches("1.heartRateZones[1]", "heartRateZones[1]") -> true
 * Example: matches("0.heartRateZones[0]", "heartRateZones[1]") -> false
 */
export const matchesPattern = (fullPath: string, pattern: string): boolean => {
  const relative = extractRelativePath(fullPath);
  return relative === pattern;
};

/**
 * Finds all paths in the data structure that match a relative pattern
 * Example: pattern "heartRateZones[1]" matches "0.heartRateZones[1]", "1.heartRateZones[1]", etc.
 */
export const findAllMatchingPaths = (
  data: any,
  pattern: string,
  basePath: string = ''
): string[] => {
  const matches: string[] = [];
  
  const traverse = (obj: any, path: string): void => {
    if (obj === null || obj === undefined) {
      return;
    }
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const itemPath = path ? `${path}[${index}]` : `[${index}]`;
        
        // Check if this path's relative matches the pattern
        const currentRelative = extractRelativePath(itemPath);
        if (currentRelative === pattern) {
          matches.push(itemPath);
        }
        
        // Recursively traverse
        traverse(item, itemPath);
      });
    } else if (typeof obj === 'object') {
      // Check if current path matches the pattern
      if (path) {
        const currentRelative = extractRelativePath(path);
        if (currentRelative === pattern) {
          matches.push(path);
        }
      }
      
      // Recursively traverse nested objects
      Object.entries(obj).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        
        // Check if this path matches the pattern
        const currentRelative = extractRelativePath(newPath);
        if (currentRelative === pattern) {
          matches.push(newPath);
        }
        
        // If value is an array, check if array element paths match
        if (Array.isArray(value)) {
          value.forEach((_, idx) => {
            const arrayPath = `${newPath}[${idx}]`;
            const arrayRelative = extractRelativePath(arrayPath);
            if (arrayRelative === pattern) {
              matches.push(arrayPath);
            }
          });
        }
        
        // Recursively traverse nested structures
        traverse(value, newPath);
      });
    }
  };
  
  // Handle root level
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const itemPath = index.toString();
      const currentRelative = extractRelativePath(itemPath);
      if (currentRelative === pattern) {
        matches.push(itemPath);
      }
      traverse(item, itemPath);
    });
  } else if (typeof data === 'object' && data !== null) {
    traverse(data, basePath || 'root');
  }
  
  return matches;
};

