export interface PathIndex {
	relativeToPaths: Map<string, string[]>;
}

export const buildPathIndex = (_data: unknown): PathIndex => ({
	relativeToPaths: new Map(),
});

export const findPathsByPattern = (
	_pattern: string,
	_index: PathIndex | null
): string[] => {
	return [];
};

