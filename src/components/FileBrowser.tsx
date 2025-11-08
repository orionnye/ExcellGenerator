import React from 'react';
import './FileBrowser.css';
import FileList from './FileList';
import FileMetrics from './FileMetrics';
import ClearButton from './ClearButton';
import { useFileData, useFileDataActions } from '../contexts/FileDataContext';

interface FileBrowserProps {
  onFolderSelected?: (folderHandle: FileSystemDirectoryHandle) => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ onFolderSelected }) => {
  const { state } = useFileData();
  const { scanFolder } = useFileDataActions();
  const { folderHandle, files, processState } = state;

  const handleFolderSelection = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert('File System Access API not supported. Please use Chrome or Edge.');
        return;
      }

      const folderHandle = await (window as any).showDirectoryPicker();
      
      console.log('Selected folder:', folderHandle.name);
      
      // Dispatch action to start scanning - state machine handles the rest
      scanFolder(folderHandle);
      onFolderSelected?.(folderHandle);
      
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error selecting folder:', error);
        alert('Error selecting folder: ' + error.message);
      }
    }
  };




  return (
    <div className="file-browser">
      <h3>Folder Browser</h3>
      
      <div className="browser-controls">
        <button 
          onClick={handleFolderSelection}
          disabled={processState === 'scanning'}
          className="browser-btn folder-btn"
        >
          {processState === 'scanning' ? 'Scanning...' : '📂 Select Folder'}
        </button>
        
        <ClearButton 
          disabled={processState === 'scanning'}
        />
      </div>

      <div className="selection-info">
        {folderHandle && (
          <div className="folder-info">
            <h4>Selected Folder:</h4>
            <p><strong>📂 {folderHandle.name}</strong></p>
          </div>
        )}

        <FileList files={files} folderName={folderHandle?.name || ''} />
        
        <FileMetrics metrics={state.metrics} />

        {!folderHandle && (
          <p className="no-selection">No folder selected</p>
        )}
      </div>
    </div>
  );
};

export default FileBrowser;