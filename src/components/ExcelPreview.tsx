import React, { useMemo } from 'react';
import './ExcelPreview.css';
import { useExcelGenerator } from '../hooks/useExcelGenerator';
import { useColumnFilter } from '../hooks/useColumnFilter';
import { useColumnDragDrop } from '../hooks/useColumnDragDrop';

const ExcelPreview: React.FC = () => {
  const excelData = useExcelGenerator();
  const columnFilter = useColumnFilter(excelData?.headers.length || 0);
  const { hiddenColumns, toggleColumn, showAllColumns, isColumnVisible, hiddenCount } = columnFilter;
  const { columnOrder, draggedColumn, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = 
    useColumnDragDrop(excelData?.headers.length || 0);

  const orderedHeaders = useMemo(() => {
    if (!excelData) return [];
    return columnOrder.map(index => ({
      index,
      header: excelData.headers[index],
    }));
  }, [excelData, columnOrder]);

  return (
    <div className="excel-preview">
      <div className="excel-preview-header">
        <h3>📊 Excel Preview</h3>
      </div>
      
      <div className="excel-preview-content">
        {!excelData && (
          <div className="excel-placeholder">
            <div className="placeholder-icon">📊</div>
            <h4>Excel Preview</h4>
            <p>Generating spreadsheet from JSON files...</p>
            <p className="placeholder-subtext">
              Column headers and first few rows will appear here
            </p>
          </div>
        )}
        
        {excelData && excelData.headers.length === 0 && (
          <div className="excel-placeholder">
            <div className="placeholder-icon">📊</div>
            <h4>Empty Dataset</h4>
            <p>No data to display</p>
          </div>
        )}
        
        {excelData && excelData.headers.length > 0 && (
          <>
            {hiddenCount > 0 && (
              <div className="hidden-columns-list">
                <div className="hidden-columns-header">
                  <h4>Hidden Columns ({hiddenCount})</h4>
                  <button onClick={showAllColumns} className="show-all-btn">
                    Show All
                  </button>
                </div>
                <div className="hidden-columns-items">
                  {hiddenColumns.map(columnIndex => (
                    <button
                      key={columnIndex}
                      onClick={() => toggleColumn(columnIndex)}
                      className="hidden-column-item"
                      title="Click to show this column"
                    >
                      {excelData.headers[columnIndex]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="excel-table-container">
              <table className="excel-table">
                <thead>
                  <tr>
                    {orderedHeaders.map(({ index: originalIndex, header }, displayIndex) => (
                      isColumnVisible(originalIndex) && (
                        <th 
                          key={originalIndex} 
                          className={`excel-header ${draggedColumn === originalIndex ? 'dragging' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(originalIndex)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            handleDragOver(e);
                          }}
                          onDrop={(e) => handleDrop(originalIndex)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="header-content">
                            <span className="drag-handle" title="Drag to reorder">⋮⋮</span>
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={() => toggleColumn(originalIndex)}
                              className="header-checkbox"
                              title="Hide column"
                              draggable={false}
                            />
                            <span className="header-text" title={header}>
                              {header}
                            </span>
                          </div>
                        </th>
                      )
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="excel-row">
                      {orderedHeaders.map(({ index: originalIndex }) => (
                        isColumnVisible(originalIndex) && (
                          <td key={originalIndex} className="excel-cell">
                            {String(row[originalIndex])}
                          </td>
                        )
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExcelPreview;

