import React from 'react';
import { StructureInfo } from './structureDetector';

interface RenderNodeOptions {
  depth: number;
  maxDepth?: number;
  structureInfo?: StructureInfo;
  isFirstOfType?: boolean;
  searchTerm?: string;
}

/**
 * Renders a JSON value as a React component with structure highlighting
 */
export const renderJsonNode = (
  value: any,
  options: RenderNodeOptions = { depth: 0 }
): React.ReactNode => {
  const { depth, maxDepth = 10, isFirstOfType = false, searchTerm } = options;
  
  const highlightSearch = (text: string): React.ReactNode => {
    if (!searchTerm || !text.toLowerCase().includes(searchTerm.toLowerCase())) {
      return text;
    }
    
    const parts: React.ReactNode[] = [];
    const lowerText = text.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase();
    let lastIndex = 0;
    let index = lowerText.indexOf(lowerSearch, lastIndex);
    
    while (index !== -1) {
      if (index > lastIndex) {
        parts.push(text.substring(lastIndex, index));
      }
      parts.push(
        React.createElement(
          'mark',
          { key: index, className: 'search-highlight' },
          text.substring(index, index + searchTerm.length)
        )
      );
      lastIndex = index + searchTerm.length;
      index = lowerText.indexOf(lowerSearch, lastIndex);
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? React.createElement('span', null, ...parts) : text;
  };
  
  if (depth > maxDepth) {
    return <span className="json-truncated">...</span>;
  }
  
  if (value === null) {
    return <span className="json-null">null</span>;
  }
  
  if (typeof value === 'undefined') {
    return <span className="json-undefined">undefined</span>;
  }
  
  if (typeof value === 'boolean') {
    return <span className="json-boolean">{value.toString()}</span>;
  }
  
  if (typeof value === 'number') {
    return <span className="json-number">{value}</span>;
  }
  
  if (typeof value === 'string') {
    return (
      <span className="json-string">
        "{highlightSearch(value)}"
      </span>
    );
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="json-empty">[]</span>;
    }
    
    return (
      <div className="json-array">
        <span className="json-bracket">[</span>
        <div className="json-indent">
          {value.map((item, index) => (
            <div key={index} className="json-item">
              {renderJsonNode(item, { ...options, depth: depth + 1 })}
              {index < value.length - 1 && <span className="json-comma">,</span>}
            </div>
          ))}
        </div>
        <span className="json-bracket">]</span>
      </div>
    );
  }
  
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    
    if (keys.length === 0) {
      return <span className="json-empty">{'{'}{'}'}</span>;
    }
    
    return (
      <div className={`json-object ${isFirstOfType ? 'json-first-of-type' : ''}`}>
        <span className="json-brace">{'{'}</span>
        <div className="json-indent">
          {keys.map((key, index) => (
            <div key={key} className="json-item">
              <span className="json-key">"{highlightSearch(key)}"</span>
              <span className="json-colon">: </span>
              {renderJsonNode(value[key], { ...options, depth: depth + 1 })}
              {index < keys.length - 1 && <span className="json-comma">,</span>}
            </div>
          ))}
        </div>
        <span className="json-brace">{'}'}</span>
      </div>
    );
  }
  
  return <span className="json-unknown">{String(value)}</span>;
};

/**
 * Renders JSON content with structure highlighting only (no selection/interaction)
 */
export const renderJsonWithStructures = (
  data: any,
  structures: StructureInfo[],
  searchTerm?: string
): React.ReactNode => {
  try {
    // Handle array of objects - highlight first of each unique structure
    if (Array.isArray(data)) {
      return (
        <div className="json-root-array">
          <span className="json-bracket">[</span>
          <div className="json-indent">
            {data.map((item, index) => {
              const structInfo = structures[index];
              const isFirstOfType = (structInfo?.isFirst && structInfo?.isDuplicate) ?? false;
              
              return (
                <div key={index} className="json-item">
                  {renderJsonNode(item, { depth: 0, isFirstOfType, searchTerm })}
                  {index < data.length - 1 && <span className="json-comma">,</span>}
                </div>
              );
            })}
          </div>
          <span className="json-bracket">]</span>
        </div>
      );
    }
    
    // Single object
    if (typeof data === 'object' && data !== null) {
      const structInfo = structures[0];
      const isFirstOfType = (structInfo?.isFirst && structInfo?.isDuplicate) ?? false;
      
      return renderJsonNode(data, { depth: 0, isFirstOfType, searchTerm });
    }
    
    // Primitive value
    return renderJsonNode(data, { depth: 0, searchTerm });
    
  } catch (error) {
    // If rendering fails, return error message
    return <span className="json-error">Error rendering JSON</span>;
  }
};

