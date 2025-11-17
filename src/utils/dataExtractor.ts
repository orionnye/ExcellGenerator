import { getValueByPath } from './pathResolver';
import { extractWrapperData } from './wrapperDetector';

/**
 * Extracts data from selected paths in JSON data
 * Automatically unwraps wrapper objects when detected
 * Pure function with no side effects - can be tested independently
 * 
 * @param parsedJsonData - The parsed JSON data (array or object)
 * @param selectedObjectPaths - Set of paths to extract
 * @returns Array of extracted values, or null if no data/selection
 */
export const extractSelectedData = (
  parsedJsonData: any,
  selectedObjectPaths: Set<string>
): any[] | null => {
  if (!parsedJsonData) {
    return null;
  }

  if (selectedObjectPaths.size === 0) {
    return null;
  }

  // Extract values for selected paths and apply wrapper extraction
  const selectedValues = Array.from(selectedObjectPaths)
    .map(path => {
      const value = getValueByPath(parsedJsonData, path);
      if (value === undefined) {
        return undefined;
      }
      // Automatically unwrap wrapper objects if detected
      return extractWrapperData(value);
    })
    .filter(item => item !== undefined);

  if (selectedValues.length === 0) {
    return null;
  }

  return selectedValues;
};

