// File System Access API type definitions
interface FileSystemDirectoryHandle {
	kind: 'directory';
	name: string;
	entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
	values(): AsyncIterableIterator<FileSystemHandle>;
	keys(): AsyncIterableIterator<string>;
	getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
	getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
	removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
}

interface FileSystemFileHandle {
	kind: 'file';
	name: string;
	getFile(): Promise<File>;
	createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
}

type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;

interface FileSystemCreateWritableOptions {
	keepExistingData?: boolean;
}

interface FileSystemWritableFileStream extends WritableStream {
	write(data: any): Promise<void>;
	seek(position: number): Promise<void>;
	truncate(size: number): Promise<void>;
	close(): Promise<void>;
}

interface Window {
	showDirectoryPicker(options?: {
		id?: string;
		mode?: 'read' | 'readwrite';
		startIn?: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
	}): Promise<FileSystemDirectoryHandle>;
	
	showOpenFilePicker(options?: {
		multiple?: boolean;
		excludeAcceptAllOption?: boolean;
		types?: FilePickerAcceptType[];
	}): Promise<FileSystemFileHandle[]>;
	
	showSaveFilePicker(options?: {
		suggestedName?: string;
		excludeAcceptAllOption?: boolean;
		types?: FilePickerAcceptType[];
	}): Promise<FileSystemFileHandle>;
}

interface FilePickerAcceptType {
	description?: string;
	accept: Record<string, string[]>;
}
