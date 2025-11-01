import React, { useMemo, useState } from 'react';
import './FileViewer.css';
import { useFileReader } from '../hooks/useFileReader';
import { highlightSearchTerms, getMatchCount } from '../utils/textHighlighter';

const FileViewer: React.FC = () => {
  const { content, fileName, fileSize, isLoading, error } = useFileReader();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const matchCount = useMemo(() => {
    if (!content || !searchTerm.trim()) {
      return 0;
    }
    return getMatchCount(content, searchTerm);
  }, [content, searchTerm]);

  const highlightedContent = useMemo(() => {
    if (!content || !searchTerm.trim()) {
      return content;
    }
    return highlightSearchTerms(content, searchTerm);
  }, [content, searchTerm]);

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
            <pre>
              {highlightedContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;
