import { FileInfo } from '../contexts/FileDataContext';

export const scanDirectory = async (
  directoryHandle: FileSystemDirectoryHandle, 
  relativePath: string = ''
): Promise<FileInfo[]> => {
  const fileList: FileInfo[] = [];
  
  try {
    for await (const [name, handle] of directoryHandle.entries()) {
      const fullPath = relativePath ? `${relativePath}/${name}` : name;
      
      if (handle.kind === 'file') {
        try {
          const file = await (handle as FileSystemFileHandle).getFile();
          fileList.push({
            name: file.name,
            size: file.size,
            path: fullPath,
          });
        } catch (error) {
          console.error(`Error getting file info for ${fullPath}:`, error);
          // Add file with unknown size if we can't get the file
          fileList.push({
            name: name,
            size: 0,
            path: fullPath,
          });
        }
      } else if (handle.kind === 'directory') {
        const subFiles = await scanDirectory(handle as FileSystemDirectoryHandle, fullPath);
        fileList.push(...subFiles);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${relativePath}:`, error);
  }
  
  return fileList;
};
