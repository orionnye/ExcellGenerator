import React, { useState } from 'react';
import './IntermediateDataDisplay.css';

interface IntermediateDataDisplayProps {
  data: any[];
}

interface ExpandableObjectProps {
  obj: any;
  index: number;
  depth?: number;
}

const ExpandableObject: React.FC<ExpandableObjectProps> = ({ obj, index, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels

  if (obj === null || obj === undefined) {
    return <span className="intermediate-null">null</span>;
  }

  if (typeof obj === 'string') {
    return <span className="intermediate-string">"{obj}"</span>;
  }

  if (typeof obj === 'number') {
    return <span className="intermediate-number">{obj}</span>;
  }

  if (typeof obj === 'boolean') {
    return <span className="intermediate-boolean">{obj.toString()}</span>;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return <span className="intermediate-empty">[]</span>;
    }

    return (
      <div className="intermediate-array">
        <button
          className="intermediate-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <span className="intermediate-toggle-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="intermediate-bracket">[</span>
          <span className="intermediate-count">{obj.length} item{obj.length !== 1 ? 's' : ''}</span>
          <span className="intermediate-bracket">]</span>
        </button>
        {isExpanded && (
          <div className="intermediate-array-content">
            {obj.map((item, i) => (
              <div key={i} className="intermediate-array-item">
                <span className="intermediate-index">[{i}]</span>
                <ExpandableObject obj={item} index={i} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    
    if (keys.length === 0) {
      return <span className="intermediate-empty">{'{'}{'}'}</span>;
    }

    return (
      <div className="intermediate-object">
        <button
          className="intermediate-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <span className="intermediate-toggle-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="intermediate-brace">{'{'}</span>
          <span className="intermediate-count">{keys.length} key{keys.length !== 1 ? 's' : ''}</span>
          <span className="intermediate-brace">{'}'}</span>
        </button>
        {isExpanded && (
          <div className="intermediate-object-content">
            {keys.map((key) => (
              <div key={key} className="intermediate-object-item">
                <span className="intermediate-key">"{key}"</span>
                <span className="intermediate-colon">: </span>
                <ExpandableObject obj={obj[key]} index={0} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span className="intermediate-unknown">{String(obj)}</span>;
};

export const IntermediateDataDisplay: React.FC<IntermediateDataDisplayProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="intermediate-data-empty">
        <div className="placeholder-icon">📊</div>
        <h4>No Intermediate Data</h4>
        <p>Select objects in the JSON viewer to see intermediate data here.</p>
      </div>
    );
  }

  return (
    <div className="intermediate-data-display">
      <div className="intermediate-data-header">
        <h4>Intermediate Data ({data.length} object{data.length !== 1 ? 's' : ''})</h4>
        <p className="intermediate-data-subtitle">
          This data will be transformed into Excel rows. Each object below becomes one Excel row.
        </p>
      </div>
      <div className="intermediate-data-list">
        {data.map((item, index) => (
          <div key={index} className="intermediate-data-row">
            <div className="intermediate-row-header">
              <span className="intermediate-row-number">Row {index + 1}</span>
              <span className="intermediate-row-indicator">→ Excel Row {index + 1}</span>
            </div>
            <div className="intermediate-row-content">
              <ExpandableObject obj={item} index={index} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

