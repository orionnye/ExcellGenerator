import React from 'react';
import './FileMetrics.css';
import { FileMetrics as FileMetricsType } from '../contexts/FileDataContext';
import { formatFileSize, formatPercentage } from '../utils/fileSizeFormatter';

interface FileMetricsProps {
  metrics: FileMetricsType;
}

const FileMetrics: React.FC<FileMetricsProps> = ({ metrics }) => {
  if (metrics.totalFiles === 0) {
    return null;
  }

  const extensionEntries = Object.entries(metrics.sizeByExtension)
    .sort(([, a], [, b]) => b.totalSize - a.totalSize);

  return (
    <div className="file-metrics">
      <h4>📊 File Metrics</h4>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Files</div>
          <div className="metric-value">{metrics.totalFiles.toLocaleString()}</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Total Size</div>
          <div className="metric-value">{formatFileSize(metrics.totalSize)}</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Average Size</div>
          <div className="metric-value">{formatFileSize(metrics.averageSize)}</div>
        </div>
      </div>

      {metrics.largestFile && (
        <div className="file-details">
          <h5>📈 Largest File</h5>
          <div className="file-info">
            <span className="file-name">{metrics.largestFile.name}</span>
            <span className="file-size">{formatFileSize(metrics.largestFile.size)}</span>
          </div>
        </div>
      )}

      {metrics.smallestFile && metrics.smallestFile.size > 0 && (
        <div className="file-details">
          <h5>📉 Smallest File</h5>
          <div className="file-info">
            <span className="file-name">{metrics.smallestFile.name}</span>
            <span className="file-size">{formatFileSize(metrics.smallestFile.size)}</span>
          </div>
        </div>
      )}

      {extensionEntries.length > 0 && (
        <div className="extension-breakdown">
          <h5>📁 By File Type</h5>
          <div className="extension-list">
            {extensionEntries.map(([extension, data]) => (
              <div key={extension} className="extension-item">
                <div className="extension-header">
                  <span className="extension-name">.{extension}</span>
                  <span className="extension-count">{data.count} files</span>
                </div>
                <div className="extension-size">
                  {formatFileSize(data.totalSize)} ({formatPercentage(data.totalSize, metrics.totalSize)})
                </div>
                <div className="extension-bar">
                  <div 
                    className="extension-bar-fill"
                    style={{ width: `${(data.totalSize / metrics.totalSize) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileMetrics;
