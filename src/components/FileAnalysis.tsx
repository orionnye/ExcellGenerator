import React, { useState } from 'react';
import './FileAnalysis.css';
import { useFileOperations } from '../hooks/useFileOperations';
import { formatFileSize } from '../utils/fileSizeFormatter';

const FileAnalysis: React.FC = () => {
  const { getExtensions, getDirectoryStats, findDuplicates } = useFileOperations();
  const [activeTab, setActiveTab] = useState<'extensions' | 'directories' | 'duplicates'>('extensions');

  const extensions = getExtensions();
  const directoryStats = getDirectoryStats();
  const duplicates = findDuplicates();

  return (
    <div className="file-analysis">
      <h4>📊 Advanced Analysis</h4>
      
      <div className="analysis-tabs">
        <button 
          className={`tab ${activeTab === 'extensions' ? 'active' : ''}`}
          onClick={() => setActiveTab('extensions')}
        >
          Extensions
        </button>
        <button 
          className={`tab ${activeTab === 'directories' ? 'active' : ''}`}
          onClick={() => setActiveTab('directories')}
        >
          Directories
        </button>
        <button 
          className={`tab ${activeTab === 'duplicates' ? 'active' : ''}`}
          onClick={() => setActiveTab('duplicates')}
        >
          Duplicates
        </button>
      </div>

      <div className="analysis-content">
        {activeTab === 'extensions' && (
          <div className="extensions-list">
            {extensions.map(ext => (
              <div key={ext} className="extension-item">
                <span className="extension-name">.{ext}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'directories' && (
          <div className="directories-list">
            {directoryStats.slice(0, 10).map(stat => (
              <div key={stat.directory} className="directory-item">
                <div className="directory-name">{stat.directory}</div>
                <div className="directory-stats">
                  {stat.fileCount} files • {formatFileSize(stat.totalSize)}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'duplicates' && (
          <div className="duplicates-list">
            {duplicates.length === 0 ? (
              <div className="no-duplicates">No duplicate files found</div>
            ) : (
              duplicates.map((dup, index) => (
                <div key={index} className="duplicate-item">
                  <div className="duplicate-name">{dup.name}</div>
                  <div className="duplicate-size">{formatFileSize(dup.size)}</div>
                  <div className="duplicate-count">{dup.paths.length} copies</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileAnalysis;
