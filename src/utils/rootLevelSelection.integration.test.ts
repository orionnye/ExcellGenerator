/// <reference types="jest" />
import { extractSelectedData } from './dataExtractor';
import { generateExcelFromJsonData } from './excelGenerator';
import { detectStructuresWithPaths } from './structurePathDetector';

describe('Root-Level Array Selection Integration', () => {
  describe('end-to-end flow: selection → extraction → Excel generation', () => {
    test('should handle root-level array of wrapper objects', () => {
      // Test data: array of wrapper objects
      const data = [
        {
          dateTime: '06/22/25 07:00:01',
          value: {
            bpm: 83,
            confidence: 3,
          },
        },
        {
          dateTime: '06/22/25 07:00:04',
          value: {
            bpm: 83,
            confidence: 3,
          },
        },
        {
          dateTime: '06/22/25 07:00:05',
          value: {
            bpm: 84,
            confidence: 3,
          },
        },
      ];

      // Step 1: Detect structures and verify paths are detected
      const structurePaths = detectStructuresWithPaths(data);
      const rootPaths = structurePaths.filter(sp => sp.path === '0' || sp.path === '1' || sp.path === '2');
      
      expect(rootPaths.length).toBe(3);
      expect(rootPaths[0].path).toBe('0');
      expect(rootPaths[0].structure).toBe('dateTime|value');
      expect(rootPaths[0].isDuplicate).toBe(true);

      // Step 2: Select root-level items (simulate user selection)
      const selectedPaths = new Set(['0', '1', '2']);

      // Step 3: Extract selected data (should auto-extract wrapper)
      const extractedData = extractSelectedData(data, selectedPaths);
      
      expect(extractedData).not.toBeNull();
      expect(Array.isArray(extractedData)).toBe(true);
      expect(extractedData!.length).toBe(3);

      // Step 4: Verify wrapper objects are auto-extracted
      // The extracted data should be the nested "value" objects, not the wrappers
      expect(extractedData![0]).toEqual({ bpm: 83, confidence: 3 });
      expect(extractedData![1]).toEqual({ bpm: 83, confidence: 3 });
      expect(extractedData![2]).toEqual({ bpm: 84, confidence: 3 });

      // Step 5: Generate Excel data from extracted data
      const excelData = generateExcelFromJsonData(extractedData!);
      
      expect(excelData).not.toBeNull();
      expect(excelData!.headers).toEqual(['bpm', 'confidence']);
      expect(excelData!.rows.length).toBe(3);
      expect(excelData!.rows[0]).toEqual([83, 3]);
      expect(excelData!.rows[1]).toEqual([83, 3]);
      expect(excelData!.rows[2]).toEqual([84, 3]);
    });

    test('should handle root-level array of flat objects', () => {
      // Test data: array of flat objects (no wrapper)
      const data = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
        { id: 3, name: 'Item 3', value: 300 },
      ];

      // Step 1: Detect structures
      const structurePaths = detectStructuresWithPaths(data);
      const rootPaths = structurePaths.filter(sp => sp.path === '0' || sp.path === '1' || sp.path === '2');
      
      expect(rootPaths.length).toBe(3);

      // Step 2: Select all items
      const selectedPaths = new Set(['0', '1', '2']);

      // Step 3: Extract selected data (should NOT extract wrapper, as these are flat objects)
      const extractedData = extractSelectedData(data, selectedPaths);
      
      expect(extractedData).not.toBeNull();
      expect(extractedData!.length).toBe(3);
      expect(extractedData![0]).toEqual({ id: 1, name: 'Item 1', value: 100 });

      // Step 4: Generate Excel data
      const excelData = generateExcelFromJsonData(extractedData!);
      
      expect(excelData).not.toBeNull();
      expect(excelData!.headers).toEqual(['id', 'name', 'value']);
      expect(excelData!.rows.length).toBe(3);
      expect(excelData!.rows[0]).toEqual([1, 'Item 1', 100]);
    });

    test('should handle mixed wrapper and flat objects', () => {
      const data = [
        {
          dateTime: '06/22/25 07:00:01',
          value: { bpm: 83, confidence: 3 },
        },
        { id: 1, name: 'Item 1' }, // Flat object
        {
          dateTime: '06/22/25 07:00:02',
          value: { bpm: 84, confidence: 2 },
        },
      ];

      const selectedPaths = new Set(['0', '1', '2']);

      const extractedData = extractSelectedData(data, selectedPaths);
      
      expect(extractedData).not.toBeNull();
      expect(extractedData!.length).toBe(3);
      
      // First item: wrapper object should be auto-extracted
      expect(extractedData![0]).toEqual({ bpm: 83, confidence: 3 });
      
      // Second item: flat object should remain as-is
      expect(extractedData![1]).toEqual({ id: 1, name: 'Item 1' });
      
      // Third item: wrapper object should be auto-extracted
      expect(extractedData![2]).toEqual({ bpm: 84, confidence: 2 });
    });

    test('should handle partial selection of root-level items', () => {
      const data = [
        {
          dateTime: '06/22/25 07:00:01',
          value: { bpm: 83, confidence: 3 },
        },
        {
          dateTime: '06/22/25 07:00:02',
          value: { bpm: 84, confidence: 2 },
        },
        {
          dateTime: '06/22/25 07:00:03',
          value: { bpm: 85, confidence: 1 },
        },
      ];

      // Select only first and third items
      const selectedPaths = new Set(['0', '2']);

      const extractedData = extractSelectedData(data, selectedPaths);
      
      expect(extractedData).not.toBeNull();
      expect(extractedData!.length).toBe(2);
      expect(extractedData![0]).toEqual({ bpm: 83, confidence: 3 });
      expect(extractedData![1]).toEqual({ bpm: 85, confidence: 1 });

      const excelData = generateExcelFromJsonData(extractedData!);
      
      expect(excelData!.rows.length).toBe(2);
      expect(excelData!.rows[0]).toEqual([83, 3]);
      expect(excelData!.rows[1]).toEqual([85, 1]);
    });

    test('should handle empty selection gracefully', () => {
      const data = [
        {
          dateTime: '06/22/25 07:00:01',
          value: { bpm: 83, confidence: 3 },
        },
      ];

      const selectedPaths = new Set<string>();

      const extractedData = extractSelectedData(data, selectedPaths);
      
      expect(extractedData).toBeNull();
    });
  });
});

