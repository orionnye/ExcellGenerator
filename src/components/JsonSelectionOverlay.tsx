import React from 'react';
import { StructureInfo } from '../utils/structureDetector';
import { StructurePathInfo } from '../utils/structurePathDetector';
import { extractRelativePath, findAllMatchingPaths } from '../utils/pathPatternMatcher';

interface JsonSelectionOverlayProps {
  data: any;
  structures: StructureInfo[];
  structurePaths: StructurePathInfo[];
  selectedPaths: Set<string>;
  onObjectClick: (path: string) => void;
  renderContent: (item: any, path: string, isFirstOfType: boolean) => React.ReactNode;
  searchTerm?: string;
}

/**
 * Helper to find structure path info by path
 */
const findStructurePathInfo = (structurePaths: StructurePathInfo[], path: string): StructurePathInfo | undefined => {
  return structurePaths.find(sp => sp.path === path);
};

/**
 * Overlay component that adds selection and click handling to JSON objects at all depths
 */
export const JsonSelectionOverlay: React.FC<JsonSelectionOverlayProps> = ({
  data,
  structures,
  structurePaths,
  selectedPaths,
  onObjectClick,
  renderContent,
  searchTerm = '',
}) => {
  // Helper to highlight search terms in keys
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
  const renderWithOverlay = (value: any, currentPath: string): React.ReactElement | null => {
    // Check if this path should be selectable
    const pathInfo = findStructurePathInfo(structurePaths, currentPath);
    const isFirstOfType = pathInfo?.isFirstOfType ?? false;
    const isSelected = selectedPaths.has(currentPath);
    const isSelectable = pathInfo !== undefined; // Only objects/arrays with detected structures
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="json-empty">[]</span>;
      }
      
      // Check if array itself is selectable
      if (isSelectable) {
        return (
          <div 
            className={`json-object-container ${isSelected ? 'json-selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              // Extract relative path pattern (e.g., "heartRateZones[1]" from "0.heartRateZones[1]")
              const relativePattern = extractRelativePath(currentPath);
              // Find all paths matching this pattern across all objects
              const allMatches = findAllMatchingPaths(data, relativePattern);
              
              console.log('Full path:', currentPath);
              console.log('Relative pattern:', relativePattern);
              console.log('All matching paths:', allMatches);
              
              // Select all matching paths
              allMatches.forEach(path => onObjectClick(path));
            }}
            title={isSelected ? 'Click to remove from Excel' : 'Click to add to Excel'}
          >
            <div className="json-array">
              <span className="json-bracket">[</span>
              <div className="json-indent">
                {value.map((item, index) => {
                  const itemPath = `${currentPath}[${index}]`;
                  return (
                    <div key={index} className="json-item">
                      {renderWithOverlay(item, itemPath)}
                      {index < value.length - 1 && <span className="json-comma">,</span>}
                    </div>
                  );
                })}
              </div>
              <span className="json-bracket">]</span>
            </div>
          </div>
        );
      }
      
      // Not selectable, just render nested
      return (
        <div className="json-array">
          <span className="json-bracket">[</span>
          <div className="json-indent">
            {value.map((item, index) => {
              const itemPath = `${currentPath}[${index}]`;
              return (
                <div key={index} className="json-item">
                  {renderWithOverlay(item, itemPath)}
                  {index < value.length - 1 && <span className="json-comma">,</span>}
                </div>
              );
            })}
          </div>
          <span className="json-bracket">]</span>
        </div>
      );
    }
    
    if (typeof value === 'object' && value !== null) {
      // Check if object itself is selectable
      if (isSelectable) {
        const keys = Object.keys(value);
        
        if (keys.length === 0) {
          return (
            <div 
              className={`json-object-container ${isSelected ? 'json-selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onObjectClick(currentPath);
              }}
              title={isSelected ? 'Click to remove from Excel' : 'Click to add to Excel'}
            >
              <span className="json-empty">{'{'}{'}'}</span>
            </div>
          );
        }
        
        return (
          <div 
            className={`json-object-container ${isSelected ? 'json-selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              // Extract relative path pattern (e.g., "heartRateZones[1]" from "0.heartRateZones[1]")
              const relativePattern = extractRelativePath(currentPath);
              // Find all paths matching this pattern across all objects
              const allMatches = findAllMatchingPaths(data, relativePattern);
              
              console.log('Full path:', currentPath);
              console.log('Relative pattern:', relativePattern);
              console.log('All matching paths:', allMatches);
              
              // Select all matching paths
              allMatches.forEach(path => onObjectClick(path));
            }}
            title={isSelected ? 'Click to remove from Excel' : 'Click to add to Excel'}
          >
            <div className={`json-object ${isFirstOfType ? 'json-first-of-type' : ''}`}>
              <span className="json-brace">{'{'}</span>
              <div className="json-indent">
                {keys.map((key, index) => {
                  const keyPath = currentPath ? `${currentPath}.${key}` : key;
                  return (
                    <div key={key} className="json-item">
                      <span className="json-key">"{highlightSearch(key)}"</span>
                      <span className="json-colon">: </span>
                      {renderWithOverlay(value[key], keyPath)}
                      {index < keys.length - 1 && <span className="json-comma">,</span>}
                    </div>
                  );
                })}
              </div>
              <span className="json-brace">{'}'}</span>
            </div>
          </div>
        );
      }
      
      // Not selectable at this level, but nested items might be
      // We need to render the object structure but make nested items selectable
      const keys = Object.keys(value);
      
      if (keys.length === 0) {
        return <span className="json-empty">{'{'}{'}'}</span>;
      }
      
      return (
        <div className={`json-object ${isFirstOfType ? 'json-first-of-type' : ''}`}>
          <span className="json-brace">{'{'}</span>
          <div className="json-indent">
            {keys.map((key, index) => {
              const keyPath = currentPath ? `${currentPath}.${key}` : key;
              return (
                <div key={key} className="json-item">
                  <span className="json-key">"{key}"</span>
                  <span className="json-colon">: </span>
                  {renderWithOverlay(value[key], keyPath)}
                  {index < keys.length - 1 && <span className="json-comma">,</span>}
                </div>
              );
            })}
          </div>
          <span className="json-brace">{'}'}</span>
        </div>
      );
    }
    
    // Primitive value - no selection overlay needed
    const rendered = renderContent(value, currentPath, false);
    // Ensure we return a valid React element
    if (rendered === null || rendered === undefined) {
      return <span>{String(value)}</span>;
    }
    return rendered as React.ReactElement;
  };
  
  // Root level rendering
  if (Array.isArray(data)) {
    return (
      <div className="json-root-array">
        <span className="json-bracket">[</span>
        <div className="json-indent">
          {data.map((item, index) => {
            const itemPath = index.toString();
            return (
              <div key={index} className="json-item">
                {renderWithOverlay(item, itemPath)}
                {index < data.length - 1 && <span className="json-comma">,</span>}
              </div>
            );
          })}
        </div>
        <span className="json-bracket">]</span>
      </div>
    );
  }
  
  if (typeof data === 'object' && data !== null) {
    return renderWithOverlay(data, 'root');
  }
  
  // Primitive value at root
  const rendered = renderContent(data, 'root', false);
  if (rendered === null || rendered === undefined) {
    return <span>{String(data)}</span>;
  }
  return rendered as React.ReactElement;
};

