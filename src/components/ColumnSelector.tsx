import React from 'react';
import './ColumnSelector.css';

interface ColumnSelectorProps {
  headers: string[];
  hiddenColumns: number[];
  onToggleColumn: (index: number) => void;
  onShowAll: () => void;
  hiddenCount: number;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  headers,
  hiddenColumns,
  onToggleColumn,
  onShowAll,
  hiddenCount,
}) => {
  return (
    <div className="column-selector">
      <div className="column-selector-header">
        <h4>Columns</h4>
        {hiddenCount > 0 && (
          <button onClick={onShowAll} className="show-all-btn">
            Show All
          </button>
        )}
      </div>
      
      <div className="column-list">
        {headers.map((header, index) => {
          const isHidden = hiddenColumns.includes(index);
          return (
            <div
              key={index}
              className={`column-item ${isHidden ? 'hidden' : ''}`}
              onClick={() => onToggleColumn(index)}
            >
              <input
                type="checkbox"
                checked={!isHidden}
                onChange={() => onToggleColumn(index)}
                className="column-checkbox"
              />
              <span className="column-name" title={header}>
                {header}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColumnSelector;

