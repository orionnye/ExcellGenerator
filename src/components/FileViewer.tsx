import React, { useMemo, useState, useCallback } from 'react';
import './FileViewer.css';
import { useFileReader } from '../hooks/useFileReader';
import { useFileData } from '../contexts/FileDataContext';
import { getMatchCount } from '../utils/textHighlighter';
import { detectDuplicateStructures } from '../utils/structureDetector';
import { detectStructuresWithPaths } from '../utils/structurePathDetector';
import { renderJsonWithStructures, renderJsonNode } from '../utils/jsonRenderer';
import { JsonSelectionOverlay } from './JsonSelectionOverlay';

const FileViewer: React.FC = () => {
  const { content, fileName, fileSize, isLoading, error } = useFileReader();
  const { state, dispatch } = useFileData();
  const { parsedJsonData, selectedObjectPaths } = state;
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Convert Set to sorted array for stable dependency checking
  const selectedPathsArray = useMemo(() => {
    return Array.from(selectedObjectPaths).sort();
  }, [selectedObjectPaths]);
  
  // Detect structures at all depths with paths
  const structurePaths = useMemo(() => {
    if (!parsedJsonData) return [];
    return detectStructuresWithPaths(parsedJsonData);
  }, [parsedJsonData]);

  const matchCount = useMemo(() => {
    if (!content || !searchTerm.trim()) {
      return 0;
    }
    return getMatchCount(content, searchTerm);
  }, [content, searchTerm]);

  // Detect duplicate structures
  const structures = useMemo(() => {
    if (!parsedJsonData) return [];
    return detectDuplicateStructures(parsedJsonData);
  }, [parsedJsonData]);

  // Handle object click for selection - use dispatch directly for stability
  const handleObjectClick = useCallback((path: string) => {
    dispatch({ type: 'TOGGLE_OBJECT_SELECTION', payload: path });
  }, [dispatch]);

  // Render JSON with structure highlighting (no selection overlay)
  // path parameter is for future use, keeping signature compatible
  const renderJsonContent = useCallback((item: any, path: string, isFirstOfType: boolean) => {
    return renderJsonNode(item, { depth: 0, isFirstOfType, searchTerm });
  }, [searchTerm]);

  // Render JSON with selection overlay
  const renderedContent = useMemo(() => {
    if (!parsedJsonData) return null;
    
    try {
      // Render raw JSON with structure highlights
      const baseRender = renderJsonWithStructures(
        parsedJsonData, 
        structures, 
        searchTerm
      );
      
      // Wrap with selection overlay if data is an object/array
      if (Array.isArray(parsedJsonData) || (typeof parsedJsonData === 'object' && parsedJsonData !== null)) {
        return (
          <JsonSelectionOverlay
            data={parsedJsonData}
            structures={structures}
            structurePaths={structurePaths}
            selectedPaths={selectedObjectPaths}
            onObjectClick={handleObjectClick}
            renderContent={renderJsonContent}
            searchTerm={searchTerm}
          />
        );
      }
      
      // Primitive values don't need overlay
      return baseRender;
    } catch (error) {
      console.error('Error rendering JSON:', error);
      return <div className="error-message">Error rendering JSON content</div>;
    }
  }, [parsedJsonData, structures, structurePaths, searchTerm, selectedPathsArray.join(','), handleObjectClick, renderJsonContent]);

  if (!fileName) {
    return (
      <div className="file-viewer">
        <div className="file-viewer-header">
          <h3>File Viewer</h3>
        </div>
        <div className="file-viewer-content">
          <div className="no-file-message">
            <p>No files selected</p>
            <p className="sub-text">Select a folder to view file contents</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="file-viewer">
      <div className="file-viewer-header">
        <h3>File Viewer</h3>
        <div className="file-header-content">
          <div className="file-info">
            <span className="file-name">{fileName}</span>
            <span className="file-size">({Math.round(fileSize / 1024)} KB)</span>
            {searchTerm.trim() && matchCount > 0 && (
              <span className="match-count-badge" title={`${matchCount} matches found`}>
                🔍 {matchCount} matches
              </span>
            )}
          </div>
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search / Filter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="search-clear-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="file-viewer-content">
        {isLoading && (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>Loading file...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}
        
        {content && !isLoading && !error && (
          <div className="file-content">
            {renderedContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;
