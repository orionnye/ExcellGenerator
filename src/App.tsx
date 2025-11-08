import React from 'react';
import './App.css';
import FileBrowser from './components/FileBrowser';
import FileViewer from './components/FileViewer';
import ExcelPreview from './components/ExcelPreview';
import { FileDataProvider } from './contexts/FileDataContext';
import { MemoryDisplay } from './components/MemoryDisplay';

function App() {
  const handleFolderSelected = (folderHandle: FileSystemDirectoryHandle) => {
    console.log('Folder selected in App:', folderHandle);
  };

  return (
    <FileDataProvider>
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <div>
              <h1>Folder Browser Demo</h1>
              <p>Select a folder to see it logged in the console</p>
            </div>
            <MemoryDisplay />
          </div>
        </header>
        
        <main className="App-main">
          <div className="left-column">
            <FileBrowser 
              onFolderSelected={handleFolderSelected}
            />
          </div>
          <div className="center-column">
            <FileViewer />
          </div>
          <div className="third-column">
            <ExcelPreview />
          </div>
        </main>
      </div>
    </FileDataProvider>
  );
}

export default App;