import { useState, useEffect } from 'react';
import { useFileData } from '../contexts/FileDataContext';

interface FileContent {
  content: string;
  fileName: string;
  fileSize: number;
  isLoading: boolean;
  error: string;
}

export const useFileReader = (): FileContent => {
  const { state } = useFileData();
  const { files, folderHandle } = state;
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadFirstFile = async () => {
      if (files.length === 0 || !folderHandle) {
        setFileContent('');
        setError('');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        // Get the first file
        const firstFile = files[0];
        
        // Find the file handle by traversing the directory
        const fileHandle = await findFileHandle(folderHandle, firstFile.path);
        
        if (!fileHandle) {
          throw new Error(`File not found: ${firstFile.name}`);
        }

        // Read the file content
        const file = await fileHandle.getFile();
        const content = await file.text();
        
        setFileContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
        setFileContent('');
      } finally {
        setIsLoading(false);
      }
    };

    loadFirstFile();
  }, [files, folderHandle]);

  const findFileHandle = async (
    directoryHandle: FileSystemDirectoryHandle, 
    filePath: string
  ): Promise<FileSystemFileHandle | null> => {
    const pathParts = filePath.split('/');
    
    if (pathParts.length === 1) {
      // File is in the root directory
      try {
        const handle = await directoryHandle.getFileHandle(pathParts[0]);
        return handle.kind === 'file' ? handle as FileSystemFileHandle : null;
      } catch {
        return null;
      }
    }

    // File is in a subdirectory
    try {
      let currentDir = directoryHandle;
      
      // Navigate to the parent directory
      for (let i = 0; i < pathParts.length - 1; i++) {
        const dirHandle = await currentDir.getDirectoryHandle(pathParts[i]);
        currentDir = dirHandle;
      }
      
      // Get the file handle
      const handle = await currentDir.getFileHandle(pathParts[pathParts.length - 1]);
      return handle.kind === 'file' ? handle as FileSystemFileHandle : null;
    } catch {
      return null;
    }
  };

  return {
    content: fileContent,
    fileName: files[0]?.name || '',
    fileSize: files[0]?.size || 0,
    isLoading,
    error,
  };
};
