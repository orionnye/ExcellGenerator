import * as XLSX from 'xlsx';

export interface JsonFileData {
	fileName: string;
	data: any;
	error?: string;
}

export const readJsonFiles = async (
	directoryHandle: FileSystemDirectoryHandle,
	filePaths: string[]
): Promise<JsonFileData[]> => {
	const jsonFiles: JsonFileData[] = [];
	
	for (const filePath of filePaths) {
		try {
			// Navigate to the file using the path
			const fileHandle = await getFileHandleByPath(directoryHandle, filePath);
			if (fileHandle) {
				const file = await fileHandle.getFile();
				const text = await file.text();
				
				// Parse JSON
				const jsonData = JSON.parse(text);
				
				jsonFiles.push({
					fileName: filePath,
					data: jsonData
				});
			}
		} catch (error) {
			console.error(`Error reading ${filePath}:`, error);
			jsonFiles.push({
				fileName: filePath,
				data: null,
				error: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
	
	return jsonFiles;
};

// Helper function to navigate to a file using its path
async function getFileHandleByPath(
	directoryHandle: FileSystemDirectoryHandle,
	filePath: string
): Promise<FileSystemFileHandle | null> {
	try {
		const pathParts = filePath.split('/');
		let currentHandle = directoryHandle;
		
		// Navigate through directories
		for (let i = 0; i < pathParts.length - 1; i++) {
			currentHandle = await currentHandle.getDirectoryHandle(pathParts[i]);
		}
		
		// Get the file handle
		const fileName = pathParts[pathParts.length - 1];
		return await currentHandle.getFileHandle(fileName);
	} catch (error) {
		console.error(`Error navigating to file ${filePath}:`, error);
		return null;
	}
}

export const generateExcelFromJsonFiles = (jsonFiles: JsonFileData[]): void => {
	// Check file limit to prevent memory issues
	const MAX_FILES = 100;
	if (jsonFiles.length > MAX_FILES) {
		alert(`⚠️ Too many files! Found ${jsonFiles.length} JSON files, but the limit is ${MAX_FILES} files to prevent memory issues.\n\nPlease select a folder with fewer files or split your data into smaller folders.`);
		return;
	}
	
	// Create a new workbook
	const workbook = XLSX.utils.book_new();
	
	// Collect all rows of data
	const allRows: Record<string, any>[] = [];
	const processedFiles: string[] = [];
	const errorFiles: string[] = [];
	
	// Process each JSON file
	jsonFiles.forEach(jsonFile => {
		if (!jsonFile.error && jsonFile.data) {
			try {
				if (Array.isArray(jsonFile.data)) {
					// If it's an array, each item becomes a row
					jsonFile.data.forEach((item, index) => {
						const flattenedItem = flattenObject(item);
						// Add metadata
						flattenedItem['_source_file'] = jsonFile.fileName;
						flattenedItem['_row_index'] = index;
						allRows.push(flattenedItem);
					});
					processedFiles.push(jsonFile.fileName);
				} else if (typeof jsonFile.data === 'object') {
					// If it's a single object, flatten it and make it one row
					const flattenedItem = flattenObject(jsonFile.data);
					// Add metadata
					flattenedItem['_source_file'] = jsonFile.fileName;
					flattenedItem['_row_index'] = 0;
					allRows.push(flattenedItem);
					processedFiles.push(jsonFile.fileName);
				}
			} catch (error) {
				console.error(`Error processing ${jsonFile.fileName}:`, error);
				errorFiles.push(jsonFile.fileName);
			}
		} else {
			errorFiles.push(jsonFile.fileName);
		}
	});
	
	// Create the main data sheet using XLSX's json_to_sheet which handles this perfectly
	const mainSheet = XLSX.utils.json_to_sheet(allRows);
	XLSX.utils.book_append_sheet(workbook, mainSheet, 'Combined Data');
	
	// Create a simple summary sheet
	const summaryData = [
		['Processing Summary'],
		[''],
		['Total Files Processed:', processedFiles.length],
		['Total Records:', allRows.length],
		['Files with Errors:', errorFiles.length],
		[''],
		['Processed Files:'],
		...processedFiles.map(file => [file]),
		[''],
		['Files with Errors:'],
		...errorFiles.map(file => [file])
	];
	
	const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
	XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
	
	// Generate Excel file and trigger download
	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
	const blob = new Blob([excelBuffer], { 
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
	});
	
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `combined-json-data-${new Date().toISOString().split('T')[0]}.xlsx`;
	
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

// Helper function to flatten nested objects
function flattenObject(obj: any, prefix = ''): Record<string, any> {
	const flattened: Record<string, any> = {};
	
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			const newKey = prefix ? `${prefix}.${key}` : key;
			
			if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
				Object.assign(flattened, flattenObject(obj[key], newKey));
			} else {
				flattened[newKey] = obj[key];
			}
		}
	}
	
	return flattened;
}
