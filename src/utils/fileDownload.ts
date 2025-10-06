import { FolderData } from '../types/FolderData';
import { readJsonFiles, generateExcelFromJsonFiles } from './excelGenerator';

export const downloadExcelFromJsonFiles = async (folderData: FolderData, directoryHandle: FileSystemDirectoryHandle) => {
	try {
		// Read all JSON files
		const jsonFiles = await readJsonFiles(directoryHandle, folderData.files);
		
		// Generate Excel file
		generateExcelFromJsonFiles(jsonFiles);
		
		return { success: true, message: 'Excel file generated successfully!' };
	} catch (error) {
		console.error('Error generating Excel file:', error);
		return { 
			success: false, 
			message: error instanceof Error ? error.message : 'Failed to generate Excel file' 
		};
	}
};
