import { useFileViewerContext } from '../contexts/FileDataContext';

/**
 * Selector hook for FileViewer component
 * Uses the separate FileViewerContext which doesn't include excelData
 * This prevents re-renders when Excel data changes
 */
export const useFileViewerData = () => {
  const context = useFileViewerContext();
  
  return {
    parsedJsonData: context.parsedJsonData,
    fileContent: context.fileContent,
    processState: context.processState,
  };
};

