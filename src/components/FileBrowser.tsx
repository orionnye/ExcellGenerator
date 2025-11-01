import React from 'react';
import './FileBrowser.css';
import FileList from './FileList';
import FileMetrics from './FileMetrics';
import ClearButton from './ClearButton';
import { scanDirectory } from '../utils/directoryScanner';
import { useFileData, useFileDataActions } from '../contexts/FileDataContext';

interface FileBrowserProps {
  onFolderSelected?: (folderHandle: FileSystemDirectoryHandle) => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ onFolderSelected }) => {
  const { state } = useFileData();
  const { setFolder, setFiles, setLoading } = useFileDataActions();
  const { folderHandle, files, isLoading } = state;

  const handleFolderSelection = async () => {
    try {
      setLoading(true);
      
      if (!('showDirectoryPicker' in window)) {
        alert('File System Access API not supported. Please use Chrome or Edge.');
        return;
      }

      const folderHandle = await (window as any).showDirectoryPicker();
      
      console.log('Selected folder:', folderHandle.name);
      
      // Automatically scan the selected folder
      const fileList = await scanDirectory(folderHandle);
      console.log('Files found:', fileList);
      
      setFolder(folderHandle);
      setFiles(fileList);
      onFolderSelected?.(folderHandle);
      
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error selecting folder:', error);
        alert('Error selecting folder: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="file-browser">
      <h3>Folder Browser</h3>
      
      <div className="browser-controls">
        <button 
          onClick={handleFolderSelection}
          disabled={isLoading}
          className="browser-btn folder-btn"
        >
          {isLoading ? 'Scanning...' : '📂 Select Folder'}
        </button>
        
        <ClearButton 
          disabled={isLoading}
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