import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { calculateMetrics } from '../utils/metricsCalculator';

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

interface FileDataState {
  folderHandle: FileSystemDirectoryHandle | null;
  files: FileInfo[];
  isLoading: boolean;
  metrics: FileMetrics;
  // Parsed JSON data from current file (stored once, referenced by viewers)
  parsedJsonData: any | null;
  // Selected object paths for Excel export (lightweight references, supports depth)
  // Path format: "0", "1.items", "2.items[0]", "root.user.profile"
  selectedObjectPaths: Set<string>;
}

type FileDataAction =
  | { type: 'SET_FOLDER'; payload: FileSystemDirectoryHandle | null }
  | { type: 'SET_FILES'; payload: FileInfo[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PARSED_JSON'; payload: any | null }
  | { type: 'TOGGLE_OBJECT_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' };

// Initial state
const initialState: FileDataState = {
  folderHandle: null,
  files: [],
  isLoading: false,
  metrics: calculateMetrics([]),
  parsedJsonData: null,
  selectedObjectPaths: new Set<string>(),
};

// Reducer function
const fileDataReducer = (state: FileDataState, action: FileDataAction): FileDataState => {
  switch (action.type) {
    case 'SET_FOLDER':
      return { ...state, folderHandle: action.payload };
    case 'SET_FILES':
      const newFiles = action.payload;
      const metrics = calculateMetrics(newFiles);
      return { ...state, files: newFiles, metrics };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PARSED_JSON':
      // Reset selection when JSON data changes
      return { 
        ...state, 
        parsedJsonData: action.payload,
        selectedObjectPaths: new Set<string>()
      };
    case 'TOGGLE_OBJECT_SELECTION':
      const newSelection = new Set(state.selectedObjectPaths);
      if (newSelection.has(action.payload)) {
        newSelection.delete(action.payload);
      } else {
        newSelection.add(action.payload);
      }
      return { ...state, selectedObjectPaths: newSelection };
    case 'CLEAR_SELECTION':
      return { 
        ...state, 
        folderHandle: null, 
        files: [], 
        isLoading: false,
        metrics: calculateMetrics([]),
        parsedJsonData: null,
        selectedObjectPaths: new Set<string>()
      };
    default:
      return state;
  }
};

// Context
interface FileDataContextType {
  state: FileDataState;
  dispatch: React.Dispatch<FileDataAction>;
}

const FileDataContext = createContext<FileDataContextType | undefined>(undefined);

// Provider component
interface FileDataProviderProps {
  children: ReactNode;
}

export const FileDataProvider: React.FC<FileDataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(fileDataReducer, initialState);

  return (
    <FileDataContext.Provider value={{ state, dispatch }}>
      {children}
    </FileDataContext.Provider>
  );
};

// Custom hook to use the context
export const useFileData = () => {
  const context = useContext(FileDataContext);
  if (context === undefined) {
    throw new Error('useFileData must be used within a FileDataProvider');
  }
  return context;
};

// Convenience hooks for specific actions
export const useFileDataActions = () => {
  const { dispatch } = useFileData();
  
  return {
    setFolder: (handle: FileSystemDirectoryHandle | null) => 
      dispatch({ type: 'SET_FOLDER', payload: handle }),
    setFiles: (files: FileInfo[]) => 
      dispatch({ type: 'SET_FILES', payload: files }),
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setParsedJson: (data: any | null) =>
      dispatch({ type: 'SET_PARSED_JSON', payload: data }),
    toggleObjectSelection: (path: string) =>
      dispatch({ type: 'TOGGLE_OBJECT_SELECTION', payload: path }),
    clearSelection: () => 
      dispatch({ type: 'CLEAR_SELECTION' }),
  };
};
