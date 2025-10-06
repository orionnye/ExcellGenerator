import React from 'react';
import { FolderData } from '../types/FolderData';
import { downloadFileCount } from '../utils/fileDownload';

interface FolderResultsProps {
	folderData: FolderData;
}

const FolderResults: React.FC<FolderResultsProps> = ({ folderData }) => {
	const handleDownload = () => {
		downloadFileCount(folderData);
	};

	return (
		<div className="folder-results">
			<div className="results-header">
				<h2>Folder Scan Results</h2>
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
							{folderData.fileCount === 1 ? 'file' : 'files'} found
						</span>
					</div>
					<button 
						onClick={handleDownload}
						className="download-btn"
						title="Download file count report as text file"
					>
						📥 Download Count Report
					</button>
				</div>
				
				{folderData.files.length > 0 && (
					<div className="files-list">
						<h3>Files ({folderData.files.length}):</h3>
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
