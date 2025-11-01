import { FileInfo } from '../contexts/FileDataContext';

export const filterFilesByExtension = (files: FileInfo[], extensions: string[]): FileInfo[] => {
  if (extensions.length === 0) return files;
  
  return files.filter(file => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    return extensions.includes(fileExtension);
  });
};

export const filterFilesBySize = (files: FileInfo[], minSize: number, maxSize: number): FileInfo[] => {
  return files.filter(file => file.size >= minSize && file.size <= maxSize);
};

export const sortFilesByName = (files: FileInfo[]): FileInfo[] => {
  return [...files].sort((a, b) => a.name.localeCompare(b.name));
};

export const sortFilesBySize = (files: FileInfo[], ascending: boolean = true): FileInfo[] => {
  return [...files].sort((a, b) => ascending ? a.size - b.size : b.size - a.size);
};

export const getFileExtensions = (files: FileInfo[]): string[] => {
  const extensions = new Set<string>();
  files.forEach(file => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'no-extension';
    extensions.add(extension);
  });
  return Array.from(extensions).sort();
};
