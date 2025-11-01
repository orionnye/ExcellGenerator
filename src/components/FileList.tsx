import React from 'react';
import './FileList.css';
import { FileInfo } from '../contexts/FileDataContext';
import { formatFileSize } from '../utils/fileSizeFormatter';

interface FileListProps {
  files: FileInfo[];
  folderName: string;
}

const FileList: React.FC<FileListProps> = ({ files, folderName }) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="file-list">
      <div className="file-list-header">
        <h4>Files in {folderName}:</h4>
        <span className="file-count">{files.length} files</span>
      </div>
      
      <div className="file-list-container">
        <ul>
          {files.map((file, index) => (
            <li key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{formatFileSize(file.size)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileList;
