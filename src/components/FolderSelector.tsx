import React, { useState } from 'react';

interface FolderSelectorProps {
	onFolderSelect: (folderPath: string | FileSystemDirectoryHandle) => void;
	isScanning: boolean;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ onFolderSelect, isScanning }) => {
	const [inputPath, setInputPath] = useState('');

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputPath(e.target.value);
	};


	const handleFolderPicker = async () => {
		try {
			// Use the File System Access API if available
			if ('showDirectoryPicker' in window) {
				const directoryHandle = await window.showDirectoryPicker();
				onFolderSelect(directoryHandle);
			} else {
				// Fallback message
				alert('File System Access API not supported in this browser. Please use Chrome, Edge, or Opera.');
			}
		} catch (error) {
			// User cancelled folder selection
			console.log('User cancelled folder selection');
		}
	};

	return (
		<div className="folder-selector">
			<h2>Select Folder with JSON Files</h2>
			
			<div className="selector-options">
				<button
					type="button"
					onClick={handleFolderPicker}
					disabled={isScanning}
					className="folder-picker-btn"
				>
					📁 Choose Folder
				</button>
				
				<span className="divider">or</span>
				
				<div className="path-input-form">
					<input
						type="text"
						value={inputPath}
						onChange={handleInputChange}
						placeholder="Manual path input requires backend service..."
						disabled={true}
						className="path-input disabled"
					/>
					<div className="info-text">
						💡 Use the folder picker button above to select a folder containing JSON files
					</div>
				</div>
			</div>
		</div>
	);
};

export default FolderSelector;
