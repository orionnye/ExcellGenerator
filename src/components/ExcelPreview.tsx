import React, { useMemo } from 'react';
import './ExcelPreview.css';
import { useExcelGenerator } from '../hooks/useExcelGenerator';
import { useColumnFilter } from '../hooks/useColumnFilter';
import { useColumnDragDrop } from '../hooks/useColumnDragDrop';
import { useFileData, useFileDataActions } from '../contexts/FileDataContext';

const ExcelPreview: React.FC = () => {
  // Excel Preview temporarily disabled - rethinking data formatting approach
  return null;
  
  /* DISABLED - Rethinking Excel generation approach
  const excelData = useExcelGenerator();
  const { state } = useFileData();
  const { generateExcel } = useFileDataActions();
  const { parsedJsonData, processState } = state;
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

  // Calculate column widths based on data content (not header length)
  const columnWidths = useMemo(() => {
    if (!excelData) return {};
    
    const widths: Record<number, number> = {};
    const CHAR_WIDTH = 8; // Approximate character width in pixels (monospace)
    const PADDING = 24; // Extra padding for readability
    
    excelData.headers.forEach((header, colIndex) => {
      let maxLength = 0;
      
      // Check all rows for this column - prioritize data over headers
      excelData.rows.forEach(row => {
        const cellValue = String(row[colIndex] || '');
        if (cellValue.length > maxLength) {
          maxLength = cellValue.length;
        }
      });
      
      // Only consider header if it's shorter than data (headers will be truncated)
      // This ensures columns are sized for data readability
      const effectiveLength = maxLength;
      
      // Calculate width: max character count * char width + padding
      widths[colIndex] = Math.max(effectiveLength * CHAR_WIDTH + PADDING, 100); // Minimum 100px
    });
    
    return widths;
  }, [excelData]);

  return (
    <div className="excel-preview">
      <div className="excel-preview-header">
        <h3>📊 Excel Preview</h3>
      </div>
      
              <div className="excel-preview-content">
                {!excelData && !parsedJsonData && (
                  <div className="excel-placeholder">
                    <div className="placeholder-icon">📊</div>
                    <h4>Excel Preview</h4>
                    <p>No JSON data available</p>
                    <p className="placeholder-subtext">
                      Parse a JSON file in the File Viewer to generate Excel data
                    </p>
                  </div>
                )}
                
                {!excelData && parsedJsonData && processState === 'jsonParsed' && (
                  <div className="excel-placeholder">
                    <div className="placeholder-icon">📊</div>
                    <h4>Excel Preview</h4>
                    <p>JSON data ready</p>
                    <p className="placeholder-subtext">
                      Click the button below to generate Excel spreadsheet
                    </p>
                    <button 
                      onClick={generateExcel}
                      className="generate-excel-btn"
                    >
                      📊 Generate Excel
                    </button>
                  </div>
                )}
                
                {!excelData && parsedJsonData && processState === 'generatingExcel' && (
                  <div className="excel-placeholder">
                    <div className="placeholder-icon">📊</div>
                    <h4>Excel Preview</h4>
                    <p>Generating spreadsheet from JSON data...</p>
                    <p className="placeholder-subtext">
                      Column headers and data will appear here
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
                          style={{ width: columnWidths[originalIndex] }}
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
                            <span 
                              className="header-text" 
                              title={header}
                            >
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
                          <td 
                            key={originalIndex} 
                            className="excel-cell"
                            style={{ width: columnWidths[originalIndex] }}
                          >
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
  */
};

export default ExcelPreview;

