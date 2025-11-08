import { useMemo } from 'react';
import { useFileViewerContext } from '../contexts/FileDataContext';

interface FileContent {
  content: string | null;
  fileName: string;
  fileSize: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to access file content from state machine
 * All file loading is now handled by the state machine
 * Uses FileViewerContext to prevent re-renders when Excel data changes
 */
export const useFileReader = (): FileContent => {
  // Use FileViewerContext (doesn't include excelData, so no re-renders when Excel changes)
  const fileViewerContext = useFileViewerContext();
  
  // Find the currently selected file
  const selectedFile = useMemo(() => {
    return fileViewerContext.selectedFilePath 
      ? fileViewerContext.files.find(f => f.path === fileViewerContext.selectedFilePath)
      : null;
  }, [fileViewerContext.files, fileViewerContext.selectedFilePath]);

  const isLoading = useMemo(() => {
    // Only check file-related loading states, not Excel generation
    return fileViewerContext.processState === 'loadingFile' 
      || fileViewerContext.processState === 'parsingJson';
  }, [fileViewerContext.processState]);

  const error = useMemo(() => {
    return fileViewerContext.processState === 'error' && fileViewerContext.processError
      ? fileViewerContext.processError
      : null;
  }, [fileViewerContext.processState, fileViewerContext.processError]);

  return useMemo(() => ({
    content: fileViewerContext.fileContent,
    fileName: selectedFile?.name || '',
    fileSize: selectedFile?.size || 0,
    isLoading,
    error,
  }), [fileViewerContext.fileContent, selectedFile, isLoading, error]);
};
