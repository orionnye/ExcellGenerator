import { useFileData } from '../contexts/FileDataContext';
import { filterFilesByExtension, filterFilesBySize, sortFilesByName, sortFilesBySize, getFileExtensions } from '../utils/fileFilters';
import { groupFilesByDirectory, getDirectoryStats, findDuplicateFiles } from '../utils/dataProcessors';

export const useFileOperations = () => {
  const { state } = useFileData();
  const { files } = state;

  return {
    // Filtering operations
    filterByExtension: (extensions: string[]) => filterFilesByExtension(files, extensions),
    filterBySize: (minSize: number, maxSize: number) => filterFilesBySize(files, minSize, maxSize),
    
    // Sorting operations
    sortByName: () => sortFilesByName(files),
    sortBySize: (ascending: boolean = true) => sortFilesBySize(files, ascending),
    
    // Analysis operations
    getExtensions: () => getFileExtensions(files),
    groupByDirectory: () => groupFilesByDirectory(files),
    getDirectoryStats: () => getDirectoryStats(files),
    findDuplicates: () => findDuplicateFiles(files),
    
    // Raw data access
    allFiles: files,
  };
};
