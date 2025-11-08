import React from 'react';
import './FileList.css';
import { FileInfo, useFileData, useFileDataActions } from '../contexts/FileDataContext';
import { formatFileSize } from '../utils/fileSizeFormatter';

interface FileListProps {
  files: FileInfo[];
  folderName: string;
}

const FileList: React.FC<FileListProps> = ({ files, folderName }) => {
  const { state } = useFileData();
  const { selectFile } = useFileDataActions();
  const { selectedFilePath } = state;

  if (files.length === 0) {
    return null;
  }

  const handleFileClick = (filePath: string) => {
    selectFile(filePath);
  };

  return (
    <div className="file-list">
      <div className="file-list-header">
        <h4>Files in {folderName}:</h4>
        <span className="file-count">{files.length} files</span>
      </div>
      
      <div className="file-list-container">
        <ul>
          {files.map((file, index) => {
            const isSelected = file.path === selectedFilePath;
            return (
              <li 
                key={index} 
                className={`file-item ${isSelected ? 'file-item-selected' : ''}`}
                onClick={() => handleFileClick(file.path)}
                title={isSelected ? 'Currently viewing' : 'Click to view in JSON inspector'}
              >
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default FileList;
