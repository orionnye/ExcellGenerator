import { useFileData } from '../contexts/FileDataContext';
import { ExcelPreviewData } from '../utils/excelGenerator';

/**
 * Hook to access Excel data from state machine
 * All Excel generation is now handled by the state machine
 */
export const useExcelGenerator = (): ExcelPreviewData | null => {
  const { state } = useFileData();
  const { excelData } = state;

  return excelData;
};

