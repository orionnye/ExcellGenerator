export interface FolderData {
	path: string;
	fileCount: number;
	files: string[];
	lastScanned: Date;
}

export interface FileInfo {
	name: string;
	size: number;
	lastModified: Date;
	type: string;
}
