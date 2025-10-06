import { useState, useCallback } from 'react';
import { FolderData } from '../types/FolderData';

export const useFolderScanner = () => {
	const [folderData, setFolderData] = useState<FolderData | null>(null);
	const [isScanning, setIsScanning] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

	const scanFolder = useCallback(async (folderPath: string | FileSystemDirectoryHandle) => {
		setIsScanning(true);
		setError(null);
		
		try {
			let files: string[] = [];
			let actualPath: string = '';

			if (folderPath instanceof FileSystemDirectoryHandle) {
				// Use File System Access API
				actualPath = folderPath.name;
				files = await scanDirectoryHandle(folderPath);
				setDirectoryHandle(folderPath); // Store the directory handle for later use
			} else {
				// Manual path input - this would need a backend service
				// For now, we'll show an error for manual paths
				throw new Error('Manual path input requires a backend service. Please use the folder picker button.');
			}
			
			const newFolderData: FolderData = {
				path: actualPath,
				fileCount: files.length,
				files: files,
				lastScanned: new Date()
			};
			
			setFolderData(newFolderData);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to scan folder');
		} finally {
			setIsScanning(false);
		}
	}, []);

	const resetFolder = useCallback(() => {
		setFolderData(null);
		setError(null);
		setDirectoryHandle(null);
	}, []);

	return {
		folderData,
		isScanning,
		error,
		directoryHandle,
		scanFolder,
		resetFolder
	};
};

// Helper function to recursively scan a directory handle for JSON files
async function scanDirectoryHandle(
	directoryHandle: FileSystemDirectoryHandle,
	relativePath: string = ''
): Promise<string[]> {
	const files: string[] = [];
	
	try {
		for await (const [name, handle] of directoryHandle.entries()) {
			const fullPath = relativePath ? `${relativePath}/${name}` : name;
			
			if (handle.kind === 'file') {
				// Only include JSON files
				if (name.toLowerCase().endsWith('.json')) {
					files.push(fullPath);
				}
			} else if (handle.kind === 'directory') {
				// Recursively scan subdirectories
				const subFiles = await scanDirectoryHandle(handle as FileSystemDirectoryHandle, fullPath);
				files.push(...subFiles);
			}
		}
	} catch (error) {
		console.error(`Error scanning directory ${relativePath}:`, error);
		// Continue scanning other files/directories even if one fails
	}
	
	return files;
}
