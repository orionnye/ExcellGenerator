import React, { useState } from 'react';
import { FolderData } from '../types/FolderData';
import { downloadExcelFromJsonFiles } from '../utils/fileDownload';

interface FolderResultsProps {
	folderData: FolderData;
	directoryHandle: FileSystemDirectoryHandle | null;
}

const FolderResults: React.FC<FolderResultsProps> = ({ folderData, directoryHandle }) => {
	const [isGenerating, setIsGenerating] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const handleDownload = async () => {
		if (!directoryHandle) {
			setMessage('Error: Directory handle not available');
			return;
		}

		setIsGenerating(true);
		setMessage(null);

		try {
			const result = await downloadExcelFromJsonFiles(folderData, directoryHandle);
			setMessage(result.message);
		} catch (error) {
			setMessage('An unexpected error occurred');
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="folder-results">
			<div className="results-header">
				<h2>JSON Files Found</h2>
				<div className="scan-info">
					Scanned on: {folderData.lastScanned.toLocaleString()}
				</div>
			</div>
			
			<div className="results-content">
				<div className="path-info">
					<strong>Path:</strong> {folderData.path}
				</div>
				
					<div className="count-info">
						<div className="file-count">
							<span className="count-number">{folderData.fileCount}</span>
							<span className="count-label">
								{folderData.fileCount === 1 ? 'JSON file' : 'JSON files'} found
							</span>
							{folderData.fileCount > 100 && (
								<div className="warning-message">
									⚠️ Warning: {folderData.fileCount} files may cause memory issues. Limit is 100 files.
								</div>
							)}
						</div>
						<button 
							onClick={handleDownload}
							className="download-btn"
							disabled={isGenerating || !directoryHandle || folderData.fileCount > 100}
							title={folderData.fileCount > 100 ? "Too many files - limit is 100" : "Generate Excel file from JSON files"}
						>
							{isGenerating ? '⏳ Generating...' : '📊 Generate Excel'}
						</button>
						{message && (
							<div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
								{message}
							</div>
						)}
					</div>
				
				{folderData.files.length > 0 && (
					<div className="files-list">
						<h3>JSON Files ({folderData.files.length}):</h3>
						<div className="files-container">
							<ul className="files-ul">
								{folderData.files.slice(0, 50).map((file, index) => (
									<li key={index} className="file-item">
										📄 {file}
									</li>
								))}
							</ul>
							{folderData.files.length > 50 && (
								<div className="more-files">
									... and {folderData.files.length - 50} more files
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default FolderResults;
