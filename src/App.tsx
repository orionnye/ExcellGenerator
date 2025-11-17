import React from 'react';
import './App.css';
import FileBrowser from './components/FileBrowser';
import FileViewer from './components/FileViewer';
import ExcelPreview from './components/ExcelPreview';
import MemoryMeter from './components/MemoryMeter';
import PerformanceMetrics from './components/PerformanceMetrics';
import { FileDataProvider } from './contexts/FileDataContext';
import { PerformanceMetricsProvider } from './contexts/PerformanceMetricsContext';

function App() {
  const handleFolderSelected = (folderHandle: FileSystemDirectoryHandle) => {
    console.log('Folder selected in App:', folderHandle);
  };

  return (
    <FileDataProvider>
      <PerformanceMetricsProvider>
        <div className="App">
        <header className="App-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Folder Browser Demo</h1>
              <p>Select a folder to see it logged in the console</p>
            </div>
            <PerformanceMetrics />
            <MemoryMeter />
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
      </PerformanceMetricsProvider>
    </FileDataProvider>
  );
}

export default App;