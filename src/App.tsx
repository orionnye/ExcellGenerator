import React from 'react';
import { useFolderScanner } from './hooks/useFolderScanner';
import FolderSelector from './components/FolderSelector';
import FolderResults from './components/FolderResults';
import './App.css';

const App: React.FC = () => {
	const { folderData, isScanning, error, scanFolder, resetFolder } = useFolderScanner();

	return (
		<div className="App">
			<header className="app-header">
				<h1>📊 Excel Generator</h1>
				<p>Scan folders and count files for Excel generation</p>
			</header>
			
			<main className="app-main">
				<FolderSelector 
					onFolderSelect={scanFolder}
					isScanning={isScanning}
				/>
				
				{error && (
					<div className="error-message">
						❌ Error: {error}
					</div>
				)}
				
				{folderData && (
					<div className="results-section">
						<FolderResults folderData={folderData} />
						<button 
							onClick={resetFolder}
							className="reset-btn"
						>
							Scan Different Folder
						</button>
					</div>
				)}
			</main>
		</div>
	);
};

export default App;
