import React, { useMemo, useState } from 'react';
import './FileViewer.css';
import { useFileReader } from '../hooks/useFileReader';
import { getMatchCount } from '../utils/textHighlighter';
import { detectDuplicateStructures } from '../utils/structureDetector';
import { renderJsonWithStructures } from '../utils/jsonRenderer';

const FileViewer: React.FC = () => {
  const { content, fileName, fileSize, isLoading, error } = useFileReader();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const matchCount = useMemo(() => {
    if (!content || !searchTerm.trim()) {
      return 0;
    }
    return getMatchCount(content, searchTerm);
  }, [content, searchTerm]);

  // Detect duplicate structures
  const structures = useMemo(() => {
    if (!content) return [];
    try {
      const parsed = JSON.parse(content);
      return detectDuplicateStructures(parsed);
    } catch {
      return [];
    }
  }, [content]);

  // Render JSON with structure highlighting
  const renderedContent = useMemo(() => {
    if (!content) return null;
    
    try {
      const rendered = renderJsonWithStructures(content, structures, searchTerm);
      return rendered;
    } catch {
      return content;
    }
  }, [content, structures, searchTerm]);

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
