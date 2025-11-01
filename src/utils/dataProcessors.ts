import { FileInfo } from '../contexts/FileDataContext';

export const groupFilesByDirectory = (files: FileInfo[]): Record<string, FileInfo[]> => {
  const grouped: Record<string, FileInfo[]> = {};
  
  files.forEach(file => {
    const directory = file.path.split('/').slice(0, -1).join('/') || 'root';
    if (!grouped[directory]) {
      grouped[directory] = [];
    }
    grouped[directory].push(file);
  });
  
  return grouped;
};

export const getDirectoryStats = (files: FileInfo[]): Array<{
  directory: string;
  fileCount: number;
  totalSize: number;
  averageSize: number;
}> => {
  const grouped = groupFilesByDirectory(files);
  
  return Object.entries(grouped).map(([directory, dirFiles]) => {
    const totalSize = dirFiles.reduce((sum, file) => sum + file.size, 0);
    return {
      directory,
      fileCount: dirFiles.length,
      totalSize,
      averageSize: totalSize / dirFiles.length,
    };
  }).sort((a, b) => b.totalSize - a.totalSize);
};

export const findDuplicateFiles = (files: FileInfo[]): Array<{
  name: string;
  size: number;
  paths: string[];
}> => {
  const fileMap = new Map<string, FileInfo[]>();
  
  files.forEach(file => {
    const key = `${file.name}-${file.size}`;
    if (!fileMap.has(key)) {
      fileMap.set(key, []);
    }
    fileMap.get(key)!.push(file);
  });
  
  return Array.from(fileMap.entries())
    .filter(([, fileList]) => fileList.length > 1)
    .map(([key, fileList]) => ({
      name: fileList[0].name,
      size: fileList[0].size,
      paths: fileList.map(f => f.path),
    }));
};
