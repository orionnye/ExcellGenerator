/// <reference types="jest" />
import { extractSelectedData } from './dataExtractor';
import { generateExcelFromJsonData } from './excelGenerator';

describe('Data Extraction Integration with Excel Generation', () => {
  describe('flat object structure', () => {
    test('should work as before (no regression)', () => {
      const testData = [
        { logId: 48899279832, activityName: 'Walk', activityTypeId: 90013 },
      ];
      const selectedPaths = new Set(['0']);

      const extracted = extractSelectedData(testData, selectedPaths);
      const excelData = generateExcelFromJsonData(extracted!);

      expect(excelData).not.toBeNull();
      expect(excelData!.headers).toContain('logId');
      expect(excelData!.headers).toContain('activityName');
      expect(excelData!.headers).toContain('activityTypeId');
      expect(excelData!.rows.length).toBe(1);
    });
  });

  describe('wrapper object structure', () => {
    test('should extract nested value and generate correct Excel', () => {
      const testData = [
        { dateTime: '10/18/24 07:00:03', value: { bpm: 65, confidence: 2 } },
      ];
      const selectedPaths = new Set(['0']);

      const extracted = extractSelectedData(testData, selectedPaths);
      expect(extracted).toEqual([{ bpm: 65, confidence: 2 }]);

      const excelData = generateExcelFromJsonData(extracted!);

      expect(excelData).not.toBeNull();
      expect(excelData!.headers).toContain('bpm');
      expect(excelData!.headers).toContain('confidence');
      expect(excelData!.headers).not.toContain('dateTime'); // Should not include wrapper metadata
      expect(excelData!.rows.length).toBe(1);
      expect(excelData!.rows[0]).toContain(65);
      expect(excelData!.rows[0]).toContain(2);
    });

    test('should handle multiple wrapper objects', () => {
      const testData = [
        { dateTime: '10/18/24 07:00:03', value: { bpm: 65, confidence: 2 } },
        { dateTime: '10/18/24 08:00:03', value: { bpm: 70, confidence: 3 } },
      ];
      const selectedPaths = new Set(['0', '1']);

      const extracted = extractSelectedData(testData, selectedPaths);
      const excelData = generateExcelFromJsonData(extracted!);

      expect(excelData).not.toBeNull();
      expect(excelData!.rows.length).toBe(2);
      expect(excelData!.headers).not.toContain('dateTime');
    });
  });

  describe('mixed structures', () => {
    test('should handle wrapper and flat objects together', () => {
      const testData = [
        { dateTime: '10/18/24 07:00:03', value: { bpm: 65 } },
        { logId: 48899279832, activityName: 'Walk' },
      ];
      const selectedPaths = new Set(['0', '1']);

      const extracted = extractSelectedData(testData, selectedPaths);
      const excelData = generateExcelFromJsonData(extracted!);

      expect(excelData).not.toBeNull();
      expect(excelData!.rows.length).toBe(2);
      // Should have columns from both structures
      expect(excelData!.headers.some(h => h.includes('bpm'))).toBe(true);
      expect(excelData!.headers.some(h => h.includes('logId') || h.includes('activityName'))).toBe(true);
    });
  });

  describe('nested path selection still works', () => {
    test('should extract nested value when nested path is explicitly selected', () => {
      const testData = [
        { dateTime: '10/18/24 07:00:03', value: { bpm: 65, confidence: 2 } },
      ];
      const selectedPaths = new Set(['0.value']);

      const extracted = extractSelectedData(testData, selectedPaths);
      const excelData = generateExcelFromJsonData(extracted!);

      expect(excelData).not.toBeNull();
      expect(excelData!.headers).toContain('bpm');
      expect(excelData!.headers).toContain('confidence');
    });
  });
});

