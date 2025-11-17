import { useMemo } from 'react';
import { useFileData } from '../contexts/FileDataContext';
import { usePerformanceMetricsContext } from '../contexts/PerformanceMetricsContext';
import { generateExcelFromJsonData, ExcelPreviewData } from '../utils/excelGenerator';
import { extractSelectedData } from '../utils/dataExtractor';

export const useExcelGenerator = (): ExcelPreviewData | null => {
  const { state } = useFileData();
  const { parsedJsonData, selectedObjectPaths } = state;
  const { trackExtraction, trackExcelGeneration } = usePerformanceMetricsContext();

  const excelData = useMemo(() => {
    // Extract selected data using unified utility
    const extractStart = performance.now();
    const dataToExport = extractSelectedData(parsedJsonData, selectedObjectPaths);
    const extractDuration = performance.now() - extractStart;
    trackExtraction(extractDuration);

    // Only generate Excel data if we have selected values
    if (!dataToExport) {
      return null;
    }

    const excelStart = performance.now();
    const result = generateExcelFromJsonData(dataToExport);
    const excelDuration = performance.now() - excelStart;
    trackExcelGeneration(excelDuration);

    return result;
  }, [parsedJsonData, selectedObjectPaths, trackExtraction, trackExcelGeneration]);

  return excelData;
};

