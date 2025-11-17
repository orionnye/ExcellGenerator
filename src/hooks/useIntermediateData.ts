import { useMemo } from 'react';
import { useFileData } from '../contexts/FileDataContext';
import { extractSelectedData } from '../utils/dataExtractor';

/**
 * Hook to get intermediate data state from selected objects
 * Returns the array of selected object values before Excel flattening
 */
export const useIntermediateData = (): any[] | null => {
  const { state } = useFileData();
  const { parsedJsonData, selectedObjectPaths } = state;

  return useMemo(() => {
    return extractSelectedData(parsedJsonData, selectedObjectPaths);
  }, [parsedJsonData, selectedObjectPaths]);
};

