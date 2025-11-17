import React, { useMemo, useState } from 'react';
import './ExcelPreview.css';
import { useExcelGenerator } from '../hooks/useExcelGenerator';
import { useColumnFilter } from '../hooks/useColumnFilter';
import { useColumnDragDrop } from '../hooks/useColumnDragDrop';
import { useFileData } from '../contexts/FileDataContext';
import { downloadExcelSheet } from '../utils/excelDownloader';
import { getValueByPath } from '../utils/pathResolver';
import { useIntermediateData } from '../hooks/useIntermediateData';
import { IntermediateDataDisplay } from './IntermediateDataDisplay';

type ViewMode = 'excel' | 'selected' | 'intermediate';

const ExcelPreview: React.FC = () => {
  const excelData = useExcelGenerator();
  const { state } = useFileData();
  const { parsedJsonData, selectedObjectPaths } = state;
  const [viewMode, setViewMode] = useState<ViewMode>('excel');
  const intermediateData = useIntermediateData();
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

  const selectedObjects = useMemo(() => {
    if (!parsedJsonData || selectedObjectPaths.size === 0) {
      return [];
    }

    return Array.from(selectedObjectPaths)
      .sort()
      .map(path => {
        const value = getValueByPath(parsedJsonData, path);
        return value === undefined ? null : { path, value };
      })
      .filter((item): item is { path: string; value: any } => item !== null);
  }, [parsedJsonData, selectedObjectPaths]);

  const handleViewChange = (mode: ViewMode) => setViewMode(mode);

  const handleDownload = () => {
    if (excelData && excelData.headers.length > 0 && excelData.rows.length > 0) {
      // Build set of visible column indices
      const visibleColumns = new Set<number>();
      for (let i = 0; i < excelData.headers.length; i++) {
        if (isColumnVisible(i)) {
          visibleColumns.add(i);
        }
      }
      
      // Pass column order and visible columns to preserve user's arrangement
      downloadExcelSheet(excelData, 'export.xlsx', columnOrder, visibleColumns);
    }
  };

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
        <div className="excel-header-content">
          <h3>📊 Excel Preview</h3>
          <div className="excel-header-actions">
            {selectedObjectPaths.size > 0 && (
              <>
                <div className="view-mode-buttons">
                  <button
                    className={`view-mode-btn ${viewMode === 'excel' ? 'active' : ''}`}
                    onClick={() => handleViewChange('excel')}
                    title="Show Excel table"
                  >
                    Excel
                  </button>
                  <button
                    className={`view-mode-btn ${viewMode === 'selected' ? 'active' : ''}`}
                    onClick={() => handleViewChange('selected')}
                    title="Show selected objects"
                  >
                    Selected
                  </button>
                <button
                    className={`view-mode-btn ${viewMode === 'intermediate' ? 'active' : ''}`}
                    onClick={() => handleViewChange('intermediate')}
                    title="Show intermediate data"
                >
                    Intermediate
                </button>
                </div>
                <span className="selection-count-badge" title={`${selectedObjectPaths.size} paths selected`}>
                  {selectedObjectPaths.size} selected
                </span>
              </>
            )}
            {excelData && excelData.headers.length > 0 && excelData.rows.length > 0 && (
              <button 
                className="excel-download-btn"
                onClick={handleDownload}
                title="Download Excel file"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Download
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="excel-preview-content">
        {viewMode === 'selected' && (
          <div className="selected-objects-panel">
            {selectedObjects.length === 0 ? (
              <div className="selected-objects-empty">
                <div className="placeholder-icon">📂</div>
                <h4>No Selected Objects</h4>
                <p>Select objects in the JSON viewer to inspect them here.</p>
              </div>
            ) : (
              <div className="selected-objects-list">
                {selectedObjects.map(({ path, value }) => (
                  <div key={path} className="selected-object-item">
                    <div className="selected-object-path">{path}</div>
                    <pre className="selected-object-value">
                      {typeof value === 'object'
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {viewMode === 'intermediate' && (
          <div className="intermediate-data-panel">
            {intermediateData ? (
              <IntermediateDataDisplay data={intermediateData} />
            ) : (
              <div className="intermediate-data-empty">
                <div className="placeholder-icon">📊</div>
                <h4>No Intermediate Data</h4>
                <p>Select objects in the JSON viewer to see intermediate data here.</p>
              </div>
            )}
          </div>
        )}
        {viewMode === 'excel' && (
          <>
            {!excelData && (
              <div className="excel-placeholder">
                <div className="placeholder-icon">📊</div>
                <h4>Excel Preview</h4>
                <p>{selectedObjectPaths.size === 0 
                  ? 'Select items in the JSON viewer to preview Excel data' 
                  : 'Generating spreadsheet from selected data...'}</p>
                <p className="placeholder-subtext">
                  {selectedObjectPaths.size === 0
                    ? 'Click objects in the JSON viewer to select them'
                    : 'Column headers and data will appear here'}
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
                                  style={{ 
                                    maxWidth: `${(columnWidths[originalIndex] || 200) - 60}px`,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
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
          </>
        )}
      </div>
    </div>
  );
};

export default ExcelPreview;

