import { useMemo } from 'react';
import { useFileData } from '../contexts/FileDataContext';
import { generateExcelFromJsonData, ExcelPreviewData } from '../utils/excelGenerator';
import { getValueByPath } from '../utils/pathResolver';

export const useExcelGenerator = (): ExcelPreviewData | null => {
  const { state } = useFileData();
  const { parsedJsonData, selectedObjectPaths } = state;

  const excelData = useMemo(() => {
    if (!parsedJsonData) {
      return null;
    }

    // Only show data when paths are explicitly selected (no auto-population)
    if (selectedObjectPaths.size === 0) {
      return null;
    }

    // Filter data based on selection
    let dataToExport: any = null;
    
    if (Array.isArray(parsedJsonData)) {
      // Get all selected paths and extract values
      const selectedValues = Array.from(selectedObjectPaths)
        .map(path => getValueByPath(parsedJsonData, path))
        .filter(item => item !== undefined);
      
      if (selectedValues.length > 0) {
        dataToExport = selectedValues;
      }
    } else if (typeof parsedJsonData === 'object' && parsedJsonData !== null) {
      // Single object - get selected paths
      const selectedValues = Array.from(selectedObjectPaths)
        .map(path => getValueByPath(parsedJsonData, path))
        .filter(item => item !== undefined);
      
      if (selectedValues.length > 0) {
        dataToExport = selectedValues;
      }
    }

    // Only generate Excel data if we have selected values
    if (!dataToExport) {
      return null;
    }

    return generateExcelFromJsonData(dataToExport);
  }, [parsedJsonData, selectedObjectPaths]);

  return excelData;
};

