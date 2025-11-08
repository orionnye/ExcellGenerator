import React, { createContext, useContext, useReducer, ReactNode, useEffect, useMemo } from 'react';
import { calculateMetrics } from '../utils/metricsCalculator';
import { scanDirectory } from '../utils/directoryScanner';
import { generateExcelFromJsonData } from '../utils/excelGenerator';

// Types
export interface FileInfo {
  name: string;
  size: number;
  path: string;
}

export interface FileMetrics {
  totalFiles: number;
  totalSize: number;
  averageSize: number;
  largestFile: FileInfo | null;
  smallestFile: FileInfo | null;
  sizeByExtension: Record<string, { count: number; totalSize: number }>;
}

// Process state machine
export type ProcessState = 
  | 'idle'
  | 'scanning'
  | 'filesLoaded'
  | 'loadingFile'
  | 'fileLoaded'
  | 'parsingJson'
  | 'jsonParsed'
  | 'generatingExcel'
  | 'ready'
  | 'error';

interface FileDataState {
  folderHandle: FileSystemDirectoryHandle | null;
  files: FileInfo[];
  metrics: FileMetrics;
  // Currently selected file path (for viewing in JSON inspector)
  selectedFilePath: string | null;
  // Raw file content (as string)
  fileContent: string | null;
  // Parsed JSON data from current file (stored once, referenced by viewers)
  parsedJsonData: any | null;
  // Excel preview data
  excelData: { headers: string[]; rows: Array<Array<string | number>> } | null;
  // Process state machine
  processState: ProcessState;
  processError: string | null;
}

type FileDataAction =
  | { type: 'SCAN_FOLDER_START'; payload: FileSystemDirectoryHandle }
  | { type: 'SCAN_FOLDER_COMPLETE'; payload: FileInfo[] }
  | { type: 'SCAN_FOLDER_ERROR'; payload: string }
  | { type: 'SELECT_FILE'; payload: string | null }
  | { type: 'LOAD_FILE_START' }
  | { type: 'LOAD_FILE_COMPLETE'; payload: string }
  | { type: 'LOAD_FILE_ERROR'; payload: string }
  | { type: 'PARSE_JSON_START' }
  | { type: 'PARSE_JSON_COMPLETE'; payload: any }
  | { type: 'PARSE_JSON_ERROR'; payload: string }
  | { type: 'GENERATE_EXCEL_START' }
  | { type: 'GENERATE_EXCEL_COMPLETE'; payload: { headers: string[]; rows: Array<Array<string | number>> } }
  | { type: 'GENERATE_EXCEL_ERROR'; payload: string }
  | { type: 'CLEAR_SELECTION' };

// Initial state
const initialState: FileDataState = {
  folderHandle: null,
  files: [],
  metrics: calculateMetrics([]),
  selectedFilePath: null,
  fileContent: null,
  parsedJsonData: null,
  excelData: null,
  processState: 'idle',
  processError: null,
};

// Reducer function
const fileDataReducer = (state: FileDataState, action: FileDataAction): FileDataState => {
  switch (action.type) {
    case 'SCAN_FOLDER_START':
      return {
        ...state,
        folderHandle: action.payload,
        processState: 'scanning',
        processError: null,
        // Clear previous data
        files: [],
        metrics: calculateMetrics([]),
        selectedFilePath: null,
        fileContent: null,
        parsedJsonData: null,
        excelData: null,
      };
    
    case 'SCAN_FOLDER_COMPLETE':
      const newFiles = action.payload;
      const metrics = calculateMetrics(newFiles);
      return {
        ...state,
        files: newFiles,
        metrics,
        selectedFilePath: null, // Don't auto-select
        processState: 'filesLoaded',
        processError: null,
      };
    
    case 'SCAN_FOLDER_ERROR':
      return {
        ...state,
        processState: 'error',
        processError: action.payload,
      };
    
    case 'SELECT_FILE':
      return {
        ...state,
        selectedFilePath: action.payload,
        // Reset downstream data when file selection changes
        fileContent: null,
        parsedJsonData: null,
        excelData: null,
        processState: action.payload ? 'filesLoaded' : state.processState,
        processError: null,
      };
    
    case 'LOAD_FILE_START':
      return {
        ...state,
        processState: 'loadingFile',
        processError: null,
        fileContent: null,
        parsedJsonData: null,
        excelData: null,
      };
    
    case 'LOAD_FILE_COMPLETE':
      return {
        ...state,
        fileContent: action.payload,
        processState: 'fileLoaded',
        processError: null,
      };
    
    case 'LOAD_FILE_ERROR':
      return {
        ...state,
        processState: 'error',
        processError: action.payload,
        fileContent: null,
      };
    
    case 'PARSE_JSON_START':
      return {
        ...state,
        processState: 'parsingJson',
        processError: null,
      };
    
    case 'PARSE_JSON_COMPLETE':
      return {
        ...state,
        parsedJsonData: action.payload,
        processState: 'jsonParsed',
        processError: null,
      };
    
    case 'PARSE_JSON_ERROR':
      return {
        ...state,
        processState: 'error',
        processError: action.payload,
        parsedJsonData: null,
      };
    
    case 'GENERATE_EXCEL_START':
      return {
        ...state,
        processState: 'generatingExcel',
        processError: null,
      };
    
    case 'GENERATE_EXCEL_COMPLETE':
      return {
        ...state,
        excelData: action.payload,
        processState: 'ready',
        processError: null,
      };
    
    case 'GENERATE_EXCEL_ERROR':
      return {
        ...state,
        processState: 'error',
        processError: action.payload,
        excelData: null,
      };
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        folderHandle: null,
        files: [],
        metrics: calculateMetrics([]),
        selectedFilePath: null,
        fileContent: null,
        parsedJsonData: null,
        excelData: null,
        processState: 'idle',
        processError: null,
      };
    
    default:
      return state;
  }
};

// Contexts - Split to prevent unnecessary re-renders
interface FileDataContextType {
  state: FileDataState;
  dispatch: React.Dispatch<FileDataAction>;
}

// Main context with all state
const FileDataContext = createContext<FileDataContextType | undefined>(undefined);

// Separate context for file viewer data (doesn't include excelData)
interface FileViewerContextType {
  parsedJsonData: any | null;
  fileContent: string | null;
  processState: ProcessState;
  processError: string | null;
  selectedFilePath: string | null;
  files: FileInfo[];
  dispatch: React.Dispatch<FileDataAction>;
}

const FileViewerContext = createContext<FileViewerContextType | undefined>(undefined);

// Provider component
interface FileDataProviderProps {
  children: ReactNode;
}

export const FileDataProvider: React.FC<FileDataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(fileDataReducer, initialState);

  // Memoize context value to prevent unnecessary re-renders
  // Only re-create when state or dispatch actually changes
  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  // Helper function to find file handle
  const findFileHandle = async (
    directoryHandle: FileSystemDirectoryHandle,
    filePath: string
  ): Promise<FileSystemFileHandle | null> => {
    const pathParts = filePath.split('/');
    
    if (pathParts.length === 1) {
      try {
        const handle = await directoryHandle.getFileHandle(pathParts[0]);
        return handle.kind === 'file' ? handle as FileSystemFileHandle : null;
      } catch {
        return null;
      }
    }

    try {
      let currentDir = directoryHandle;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const dirHandle = await currentDir.getDirectoryHandle(pathParts[i]);
        currentDir = dirHandle;
      }
      const handle = await currentDir.getFileHandle(pathParts[pathParts.length - 1]);
      return handle.kind === 'file' ? handle as FileSystemFileHandle : null;
    } catch {
      return null;
    }
  };

  // Handle async operations based on process state
  useEffect(() => {
    const handleAsyncOperations = async () => {
      // State 1: Scanning folder
      if (state.processState === 'scanning' && state.folderHandle) {
        try {
          const files = await scanDirectory(state.folderHandle);
          dispatch({ type: 'SCAN_FOLDER_COMPLETE', payload: files });
        } catch (error) {
          dispatch({ 
            type: 'SCAN_FOLDER_ERROR', 
            payload: error instanceof Error ? error.message : 'Failed to scan folder' 
          });
        }
      }

      // State 2: Loading file (only when explicitly triggered)
      if (state.processState === 'loadingFile' && state.selectedFilePath && state.folderHandle) {
        const selectedFile = state.files.find(f => f.path === state.selectedFilePath);
        if (selectedFile) {
          try {
            const fileHandle = await findFileHandle(state.folderHandle, selectedFile.path);
            if (!fileHandle) {
              throw new Error(`File not found: ${selectedFile.name}`);
            }
            const file = await fileHandle.getFile();
            const content = await file.text();
            dispatch({ type: 'LOAD_FILE_COMPLETE', payload: content });
          } catch (error) {
            dispatch({ 
              type: 'LOAD_FILE_ERROR', 
              payload: error instanceof Error ? error.message : 'Failed to load file' 
            });
          }
        }
      }

      // State 3: Parsing JSON (only when explicitly triggered)
      if (state.processState === 'parsingJson' && state.fileContent) {
        try {
          const parsed = JSON.parse(state.fileContent);
          dispatch({ type: 'PARSE_JSON_COMPLETE', payload: parsed });
        } catch (error) {
          dispatch({ 
            type: 'PARSE_JSON_ERROR', 
            payload: error instanceof Error ? error.message : 'Failed to parse JSON' 
          });
        }
      }

      // State 4: Generating Excel (only when explicitly triggered)
      if (state.processState === 'generatingExcel' && state.parsedJsonData) {
        try {
          const excelData = generateExcelFromJsonData(state.parsedJsonData);
          if (excelData) {
            dispatch({ type: 'GENERATE_EXCEL_COMPLETE', payload: excelData });
          } else {
            dispatch({ type: 'GENERATE_EXCEL_ERROR', payload: 'Failed to generate Excel data' });
          }
        } catch (error) {
          dispatch({ 
            type: 'GENERATE_EXCEL_ERROR', 
            payload: error instanceof Error ? error.message : 'Failed to generate Excel' 
          });
        }
      }
    };

    handleAsyncOperations();
  }, [state.processState, state.folderHandle, state.selectedFilePath, state.fileContent, state.parsedJsonData, state.files]);

  // Separate context value for file viewer (excludes excelData to prevent re-renders)
  // Filter processState to only include file-related states, not Excel generation states
  // This prevents FileViewer from re-rendering when Excel is generated
  const fileViewerProcessState = useMemo(() => {
    // Map Excel-related states back to the last file-related state
    // FileViewer doesn't need to know about Excel generation
    if (state.processState === 'generatingExcel' || state.processState === 'ready') {
      return 'jsonParsed'; // Last file-related state before Excel generation
    }
    return state.processState;
  }, [state.processState]);

  const fileViewerContextValue = useMemo(() => ({
    parsedJsonData: state.parsedJsonData,
    fileContent: state.fileContent,
    processState: fileViewerProcessState,
    processError: state.processError,
    selectedFilePath: state.selectedFilePath,
    files: state.files,
    dispatch,
  }), [state.parsedJsonData, state.fileContent, fileViewerProcessState, state.processError, state.selectedFilePath, state.files, dispatch]);

  return (
    <FileDataContext.Provider value={contextValue}>
      <FileViewerContext.Provider value={fileViewerContextValue}>
        {children}
      </FileViewerContext.Provider>
    </FileDataContext.Provider>
  );
};

// Custom hook to use the main context (includes excelData)
export const useFileData = () => {
  const context = useContext(FileDataContext);
  if (context === undefined) {
    throw new Error('useFileData must be used within a FileDataProvider');
  }
  return context;
};

// Custom hook to use the file viewer context (excludes excelData)
export const useFileViewerContext = () => {
  const context = useContext(FileViewerContext);
  if (context === undefined) {
    throw new Error('useFileViewerContext must be used within a FileDataProvider');
  }
  return context;
};

// Convenience hooks for specific actions
export const useFileDataActions = () => {
  const { dispatch } = useFileData();
  
  return {
    scanFolder: (handle: FileSystemDirectoryHandle) => 
      dispatch({ type: 'SCAN_FOLDER_START', payload: handle }),
    selectFile: (filePath: string | null) =>
      dispatch({ type: 'SELECT_FILE', payload: filePath }),
    loadFile: () =>
      dispatch({ type: 'LOAD_FILE_START' }),
    parseJson: () =>
      dispatch({ type: 'PARSE_JSON_START' }),
    generateExcel: () =>
      dispatch({ type: 'GENERATE_EXCEL_START' }),
    clearSelection: () => 
      dispatch({ type: 'CLEAR_SELECTION' }),
  };
};
