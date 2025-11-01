import { useState, useCallback, useEffect } from 'react';

export const useColumnDragDrop = (totalColumns: number) => {
  const [columnOrder, setColumnOrder] = useState<number[]>(() => 
    Array.from({ length: totalColumns }, (_, i) => i)
  );
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);

  useEffect(() => {
    setColumnOrder(Array.from({ length: totalColumns }, (_, i) => i));
  }, [totalColumns]);

  const handleDragStart = useCallback((columnIndex: number) => {
    setDraggedColumn(columnIndex);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((dropColumnIndex: number) => {
    if (draggedColumn === null) return;
    if (draggedColumn === dropColumnIndex) return;

    setColumnOrder(prevOrder => {
      const newOrder = [...prevOrder];
      
      // Find positions in the ordered array
      const draggedPos = newOrder.indexOf(draggedColumn);
      const dropPos = newOrder.indexOf(dropColumnIndex);
      
      if (draggedPos === -1 || dropPos === -1) return prevOrder;
      if (draggedPos === dropPos) return prevOrder;
      
      // Remove dragged item from its position
      newOrder.splice(draggedPos, 1);
      
      // Insert at new position
      newOrder.splice(dropPos, 0, draggedColumn);
      
      return newOrder;
    });

    setDraggedColumn(null);
  }, [draggedColumn]);

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null);
  }, []);

  return {
    columnOrder,
    draggedColumn,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};

