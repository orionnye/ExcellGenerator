import { FileInfo, FileMetrics } from '../contexts/FileDataContext';

export const calculateMetrics = (files: FileInfo[]): FileMetrics => {
  if (files.length === 0) {
    return {
      totalFiles: 0,
      totalSize: 0,
      averageSize: 0,
      largestFile: null,
      smallestFile: null,
      sizeByExtension: {},
    };
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const averageSize = totalSize / files.length;
  
  const largestFile = files.reduce((largest, file) => 
    !largest || file.size > largest.size ? file : largest, null as FileInfo | null
  );
  
  const smallestFile = files.reduce((smallest, file) => 
    !smallest || file.size < smallest.size ? file : smallest, null as FileInfo | null
  );

  // Group by extension
  const sizeByExtension: Record<string, { count: number; totalSize: number }> = {};
  files.forEach(file => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'no-extension';
    if (!sizeByExtension[extension]) {
      sizeByExtension[extension] = { count: 0, totalSize: 0 };
    }
    sizeByExtension[extension].count++;
    sizeByExtension[extension].totalSize += file.size;
  });

  return {
    totalFiles: files.length,
    totalSize,
    averageSize,
    largestFile,
    smallestFile,
    sizeByExtension,
  };
};
