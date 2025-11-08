import React, { useMemo, useState } from 'react';
import './FileViewer.css';
import { useFileReader } from '../hooks/useFileReader';
import { useFileDataActions } from '../contexts/FileDataContext';
import { useFileViewerData } from '../hooks/useFileViewerData';
import { getMatchCount } from '../utils/textHighlighter';
import { renderJsonNode } from '../utils/jsonRenderer';
import { formatFileSize } from '../utils/fileSizeFormatter';

const FileViewer: React.FC = () => {
  const { content, fileName, fileSize, isLoading, error } = useFileReader();
  const { loadFile, parseJson } = useFileDataActions();
  const { parsedJsonData, fileContent, processState } = useFileViewerData();
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Only calculate match count if search term exists (performance optimization)
  const matchCount = useMemo(() => {
    if (!content || !searchTerm.trim()) {
      return 0;
    }
    // Skip calculation for very large files to avoid blocking
    const fileSizeKB = fileSize / 1024;
    if (fileSizeKB > 10000) { // 10MB+ files
      return 0; // Don't block UI with regex on huge files
    }
    return getMatchCount(content, searchTerm);
  }, [content, searchTerm, fileSize]);

  // Render JSON content
  const renderedContent = useMemo(() => {
    if (!parsedJsonData) return null;
    
    try {
      return renderJsonNode(parsedJsonData, { 
        depth: 0, 
        searchTerm,
      });
    } catch (error) {
      console.error('Error rendering JSON:', error);
      return <div className="error-message">Error rendering JSON content</div>;
    }
  }, [parsedJsonData, searchTerm]);

  // Show empty state with load button
  if (!fileName) {
    return (
      <div className="file-viewer">
        <div className="file-viewer-header">
          <h3>File Viewer</h3>
        </div>
        <div className="file-viewer-content">
          <div className="no-file-message">
            <p>No files selected</p>
            <p className="sub-text">Select a file from the folder browser to view its contents</p>
          </div>
        </div>
      </div>
    );
  }

  // Show load button if file is selected but not loaded
  if (!fileContent && !isLoading && processState === 'filesLoaded') {
    return (
      <div className="file-viewer">
        <div className="file-viewer-header">
          <h3>File Viewer</h3>
          <div className="file-header-content">
            <div className="file-info">
              <span className="file-name">{fileName}</span>
              <span className="file-size">({formatFileSize(fileSize)})</span>
            </div>
          </div>
        </div>
        <div className="file-viewer-content">
          <div className="no-file-message">
            <p>File selected: <strong>{fileName}</strong></p>
            <p className="placeholder-subtext">Click the button below to load and parse the file</p>
            <button 
              onClick={loadFile}
              className="generate-excel-btn"
              disabled={isLoading}
            >
              📄 Load File
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show parse button if file is loaded but not parsed
  if (fileContent && !parsedJsonData && !isLoading && processState === 'fileLoaded') {
    return (
      <div className="file-viewer">
        <div className="file-viewer-header">
          <h3>File Viewer</h3>
          <div className="file-header-content">
            <div className="file-info">
              <span className="file-name">{fileName}</span>
              <span className="file-size">({formatFileSize(fileSize)})</span>
            </div>
          </div>
        </div>
        <div className="file-viewer-content">
          <div className="no-file-message">
            <p>File loaded: <strong>{fileName}</strong></p>
            <p className="placeholder-subtext">Click the button below to parse JSON and display content</p>
            <button 
              onClick={parseJson}
              className="generate-excel-btn"
              disabled={isLoading}
            >
              🔍 Parse JSON
            </button>
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
            <span className="file-size">({formatFileSize(fileSize)})</span>
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
