import { useState, useCallback } from 'react';

export const useColumnFilter = (totalColumns: number) => {
  const [hiddenColumns, setHiddenColumns] = useState<Set<number>>(new Set());

  const toggleColumn = useCallback((index: number) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const showAllColumns = useCallback(() => {
    setHiddenColumns(new Set());
  }, []);

  const isColumnVisible = useCallback((index: number) => {
    return !hiddenColumns.has(index);
  }, [hiddenColumns]);

  return {
    hiddenColumns: Array.from(hiddenColumns).sort((a, b) => a - b),
    toggleColumn,
    showAllColumns,
    isColumnVisible,
    hiddenCount: hiddenColumns.size,
  };
};

