/**
 * Browser Storage Metrics Utility
 * Provides information about browser storage quotas and memory usage
 */

import { formatFileSize, formatPercentage } from './fileSizeFormatter';

export interface StorageMetrics {
	storage?: {
		quota: number; // Total storage quota in bytes
		usage: number; // Current storage usage in bytes
		usageDetails?: {
			indexedDB?: number;
			localStorage?: number;
			serviceWorker?: number;
			cache?: number;
		};
	};
	memory?: {
		jsHeapSizeLimit: number; // Maximum heap size in bytes
		totalJSHeapSize: number; // Current total heap size in bytes
		usedJSHeapSize: number; // Currently used heap size in bytes
	};
}

/**
 * Gets browser storage quota and usage estimates
 * Returns null if Storage API is not available
 */
export const getStorageEstimate = async (): Promise<{
	quota: number;
	usage: number;
	usageDetails?: Record<string, number>;
} | null> => {
	if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
		return null;
	}

	try {
		const estimate = await navigator.storage.estimate();
		return {
			quota: estimate.quota || 0,
			usage: estimate.usage || 0,
			usageDetails: (estimate as any).usageDetails as Record<string, number> | undefined,
		};
	} catch (error) {
		console.error('Error getting storage estimate:', error);
		return null;
	}
};

/**
 * Gets JavaScript heap memory information (Chrome/Edge only)
 * Returns null if performance.memory is not available
 */
export const getMemoryInfo = (): {
	jsHeapSizeLimit: number;
	totalJSHeapSize: number;
	usedJSHeapSize: number;
	available: number;
} | null => {
	if (!('memory' in performance) || !(performance as any).memory) {
		return null;
	}

	const memory = (performance as any).memory;
	return {
		jsHeapSizeLimit: memory.jsHeapSizeLimit || 0,
		totalJSHeapSize: memory.totalJSHeapSize || 0,
		usedJSHeapSize: memory.usedJSHeapSize || 0,
		available: memory.jsHeapSizeLimit - memory.usedJSHeapSize,
	};
};

/**
 * Gets comprehensive browser storage and memory metrics
 */
export const getBrowserStorageMetrics = async (): Promise<StorageMetrics> => {
	const [storage, memory] = await Promise.all([
		getStorageEstimate(),
		Promise.resolve(getMemoryInfo()),
	]);

	return {
		...(storage && {
			storage: {
				quota: storage.quota,
				usage: storage.usage,
				usageDetails: storage.usageDetails,
			},
		}),
		...(memory && {
			memory: {
				jsHeapSizeLimit: memory.jsHeapSizeLimit,
				totalJSHeapSize: memory.totalJSHeapSize,
				usedJSHeapSize: memory.usedJSHeapSize,
			},
		}),
	};
};

/**
 * Formats storage metrics as human-readable strings
 */
export const formatStorageMetrics = (metrics: StorageMetrics): {
	storage?: {
		quota: string;
		usage: string;
		usagePercentage: string;
		available: string;
	};
	memory?: {
		heapLimit: string;
		totalHeap: string;
		usedHeap: string;
		available: string;
		usagePercentage: string;
	};
} => {
	const result: ReturnType<typeof formatStorageMetrics> = {};

	if (metrics.storage) {
		const { quota, usage } = metrics.storage;
		result.storage = {
			quota: formatFileSize(quota),
			usage: formatFileSize(usage),
			usagePercentage: formatPercentage(usage, quota),
			available: formatFileSize(quota - usage),
		};
	}

	if (metrics.memory) {
		const { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = metrics.memory;
		result.memory = {
			heapLimit: formatFileSize(jsHeapSizeLimit),
			totalHeap: formatFileSize(totalJSHeapSize),
			usedHeap: formatFileSize(usedJSHeapSize),
			available: formatFileSize(jsHeapSizeLimit - usedJSHeapSize),
			usagePercentage: formatPercentage(usedJSHeapSize, jsHeapSizeLimit),
		};
	}

	return result;
};

