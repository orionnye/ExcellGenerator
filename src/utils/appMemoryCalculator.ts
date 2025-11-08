/**
 * Application Memory Calculator
 * Estimates memory consumption from application data
 */

import { useFileData } from '../contexts/FileDataContext';
import { useFileReader } from '../hooks/useFileReader';
import { useExcelGenerator } from '../hooks/useExcelGenerator';

/**
 * Estimates memory size of a JavaScript value
 * Approximate calculation (not exact)
 */
const estimateObjectSize = (obj: any): number => {
	if (obj === null || obj === undefined) {
		return 0;
	}
	
	if (typeof obj === 'string') {
		// Strings: 2 bytes per character (UTF-16) + object overhead
		return obj.length * 2 + 24;
	}
	
	if (typeof obj === 'number') {
		// Numbers: 8 bytes (double precision)
		return 8;
	}
	
	if (typeof obj === 'boolean') {
		// Booleans: 4 bytes
		return 4;
	}
	
	if (Array.isArray(obj)) {
		// Array overhead + sum of elements
		let size = 48; // Array object overhead
		obj.forEach(item => {
			size += estimateObjectSize(item);
		});
		return size;
	}
	
	if (typeof obj === 'object') {
		// Object overhead + sum of properties
		let size = 48; // Object overhead
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				size += key.length * 2; // Key string size
				size += estimateObjectSize(obj[key]); // Value size
			}
		}
		return size;
	}
	
	// Unknown type - conservative estimate
	return 24;
};

/**
 * Gets estimated memory usage from application state
 */
export const getAppMemoryUsage = (): {
	fileContent: number;
	parsedJson: number;
	excelData: number;
	total: number;
} => {
	// Note: This is a hook so it can't be called directly
	// We'll need to pass data from components
	return {
		fileContent: 0,
		parsedJson: 0,
		excelData: 0,
		total: 0,
	};
};

/**
 * Estimates memory usage from application data
 */
export const estimateMemoryUsage = (
	fileContent: string | null,
	parsedJsonData: any | null,
	excelData: { headers: string[]; rows: Array<Array<string | number>> } | null
): {
	fileContent: number;
	parsedJson: number;
	excelData: number;
	total: number;
} => {
	const fileContentSize = fileContent ? fileContent.length * 2 : 0; // UTF-16 string
	const parsedJsonSize = parsedJsonData ? estimateObjectSize(parsedJsonData) : 0;
	
	// Excel data: headers array + rows array
	let excelDataSize = 0;
	if (excelData) {
		excelDataSize += estimateObjectSize(excelData.headers);
		excelDataSize += estimateObjectSize(excelData.rows);
	}
	
	return {
		fileContent: fileContentSize,
		parsedJson: parsedJsonSize,
		excelData: excelDataSize,
		total: fileContentSize + parsedJsonSize + excelDataSize,
	};
};

