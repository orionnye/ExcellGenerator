import { useMemo } from 'react';
import { useFileReader } from './useFileReader';
import { generateExcelFromJson, ExcelPreviewData } from '../utils/excelGenerator';

export const useExcelGenerator = (): ExcelPreviewData | null => {
  const { content } = useFileReader();

  const excelData = useMemo(() => {
    if (!content) {
      return null;
    }

    return generateExcelFromJson(content);
  }, [content]);

  return excelData;
};

