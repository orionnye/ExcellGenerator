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
}

type FileDataAction =
  | { type: 'SET_FOLDER'; payload: FileSystemDirectoryHandle | null }
  | { type: 'SET_FILES'; payload: FileInfo[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_SELECTION' };

// Initial state
const initialState: FileDataState = {
  folderHandle: null,
  files: [],
  isLoading: false,
  metrics: calculateMetrics([]),
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
    case 'CLEAR_SELECTION':
      return { 
        ...state, 
        folderHandle: null, 
        files: [], 
        isLoading: false,
        metrics: calculateMetrics([])
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
    clearSelection: () => 
      dispatch({ type: 'CLEAR_SELECTION' }),
  };
};
