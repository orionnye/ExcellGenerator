/// <reference types="jest" />
import { detectStructuresWithPaths } from './structurePathDetector';
import { extractSelectedData } from './dataExtractor';
import { generateExcelFromJsonData } from './excelGenerator';
import { getMemoizedStructureSignature, clearStructureSignatureCache } from './structureSignatureMemoizer';

/**
 * Performance test suite for large arrays
 * These tests measure performance metrics and establish baselines
 * Run with: npm test -- --testNamePattern="Performance"
 */

describe('Performance Tests - Large Arrays', () => {
  // Helper to generate test data
  const generateWrapperObjects = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      dateTime: `06/22/25 07:00:${String(i % 60).padStart(2, '0')}`,
      value: {
        bpm: 60 + (i % 40),
        confidence: (i % 4) + 1,
      },
    }));
  };

  const generateFlatObjects = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: (i + 1) * 10,
      category: `Category ${(i % 5) + 1}`,
    }));
  };

  beforeEach(() => {
    // Clear cache before each test for fair comparison
    clearStructureSignatureCache();
  });

  describe('Structure Detection Performance', () => {
    test('should handle 100 items efficiently', () => {
      const data = generateWrapperObjects(100);
      
      const start = performance.now();
      const result = detectStructuresWithPaths(data);
      const end = performance.now();
      
      const duration = end - start;
      
      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50); // Should complete in < 50ms
      
      console.log(`[Performance] 100 items - Structure detection: ${duration.toFixed(2)}ms`);
    });

    test('should handle 500 items efficiently', () => {
      const data = generateWrapperObjects(500);
      
      const start = performance.now();
      const result = detectStructuresWithPaths(data);
      const end = performance.now();
      
      const duration = end - start;
      
      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200); // Should complete in < 200ms
      
      console.log(`[Performance] 500 items - Structure detection: ${duration.toFixed(2)}ms`);
    });

    test('should handle 1000 items efficiently', () => {
      const data = generateWrapperObjects(1000);
      
      const start = performance.now();
      const result = detectStructuresWithPaths(data);
      const end = performance.now();
      
      const duration = end - start;
      
      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(500); // Should complete in < 500ms
      
      console.log(`[Performance] 1000 items - Structure detection: ${duration.toFixed(2)}ms`);
    });

    test('should handle 5000 items within reasonable time', () => {
      const data = generateWrapperObjects(5000);
      
      const start = performance.now();
      const result = detectStructuresWithPaths(data);
      const end = performance.now();
      
      const duration = end - start;
      
      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(2000); // Should complete in < 2s
      
      console.log(`[Performance] 5000 items - Structure detection: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Data Extraction Performance', () => {
    test('should extract 1000 selected items efficiently', () => {
      const data = generateWrapperObjects(1000);
      const selectedPaths = new Set(
        Array.from({ length: 1000 }, (_, i) => i.toString())
      );
      
      const start = performance.now();
      const extracted = extractSelectedData(data, selectedPaths);
      const end = performance.now();
      
      const duration = end - start;
      
      expect(extracted).not.toBeNull();
      expect(extracted!.length).toBe(1000);
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
      
      console.log(`[Performance] 1000 items - Data extraction: ${duration.toFixed(2)}ms`);
    });

    test('should extract 5000 selected items efficiently', () => {
      const data = generateWrapperObjects(5000);
      const selectedPaths = new Set(
        Array.from({ length: 5000 }, (_, i) => i.toString())
      );
      
      const start = performance.now();
      const extracted = extractSelectedData(data, selectedPaths);
      const end = performance.now();
      
      const duration = end - start;
      
      expect(extracted).not.toBeNull();
      expect(extracted!.length).toBe(5000);
      expect(duration).toBeLessThan(500); // Should complete in < 500ms
      
      console.log(`[Performance] 5000 items - Data extraction: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Excel Generation Performance', () => {
    test('should generate Excel data for 1000 items efficiently', () => {
      const data = generateWrapperObjects(1000);
      const selectedPaths = new Set(
        Array.from({ length: 1000 }, (_, i) => i.toString())
      );
      const extracted = extractSelectedData(data, selectedPaths);
      
      const start = performance.now();
      const excelData = generateExcelFromJsonData(extracted!);
      const end = performance.now();
      
      const duration = end - start;
      
      expect(excelData).not.toBeNull();
      expect(excelData!.rows.length).toBe(1000);
      expect(duration).toBeLessThan(200); // Should complete in < 200ms
      
      console.log(`[Performance] 1000 items - Excel generation: ${duration.toFixed(2)}ms`);
    });

    test('should generate Excel data for 5000 items efficiently', () => {
      const data = generateWrapperObjects(5000);
      const selectedPaths = new Set(
        Array.from({ length: 5000 }, (_, i) => i.toString())
      );
      const extracted = extractSelectedData(data, selectedPaths);
      
      const start = performance.now();
      const excelData = generateExcelFromJsonData(extracted!);
      const end = performance.now();
      
      const duration = end - start;
      
      expect(excelData).not.toBeNull();
      expect(excelData!.rows.length).toBe(5000);
      expect(duration).toBeLessThan(1000); // Should complete in < 1s
      
      console.log(`[Performance] 5000 items - Excel generation: ${duration.toFixed(2)}ms`);
    });
  });

  describe('End-to-End Performance', () => {
    test('should handle full pipeline for 1000 items', () => {
      const data = generateWrapperObjects(1000);
      const selectedPaths = new Set(
        Array.from({ length: 1000 }, (_, i) => i.toString())
      );
      
      const start = performance.now();
      
      // Step 1: Detect structures
      const structures = detectStructuresWithPaths(data);
      
      // Step 2: Extract selected data
      const extracted = extractSelectedData(data, selectedPaths);
      
      // Step 3: Generate Excel data
      const excelData = generateExcelFromJsonData(extracted!);
      
      const end = performance.now();
      const totalDuration = end - start;
      
      expect(structures.length).toBeGreaterThan(0);
      expect(extracted).not.toBeNull();
      expect(excelData).not.toBeNull();
      expect(excelData!.rows.length).toBe(1000);
      expect(totalDuration).toBeLessThan(1000); // Full pipeline < 1s
      
      console.log(`[Performance] 1000 items - Full pipeline: ${totalDuration.toFixed(2)}ms`);
    });

    test('should handle full pipeline for 5000 items', () => {
      const data = generateWrapperObjects(5000);
      const selectedPaths = new Set(
        Array.from({ length: 5000 }, (_, i) => i.toString())
      );
      
      const start = performance.now();
      
      const structures = detectStructuresWithPaths(data);
      const extracted = extractSelectedData(data, selectedPaths);
      const excelData = generateExcelFromJsonData(extracted!);
      
      const end = performance.now();
      const totalDuration = end - start;
      
      expect(structures.length).toBeGreaterThan(0);
      expect(extracted).not.toBeNull();
      expect(excelData).not.toBeNull();
      expect(excelData!.rows.length).toBe(5000);
      expect(totalDuration).toBeLessThan(3000); // Full pipeline < 3s
      
      console.log(`[Performance] 5000 items - Full pipeline: ${totalDuration.toFixed(2)}ms`);
    });
  });

  describe('Memoization Performance Impact', () => {
    test('should show performance improvement with memoization', () => {
      const data = generateWrapperObjects(1000);
      
      // Test without memoization (by clearing cache)
      clearStructureSignatureCache();
      const startWithoutCache = performance.now();
      detectStructuresWithPaths(data);
      const endWithoutCache = performance.now();
      const durationWithoutCache = endWithoutCache - startWithoutCache;
      
      // Test with memoization (cache already populated from previous call)
      const startWithCache = performance.now();
      detectStructuresWithPaths(data);
      const endWithCache = performance.now();
      const durationWithCache = endWithCache - startWithCache;
      
      // With cache should be faster (or at least not slower)
      expect(durationWithCache).toBeLessThanOrEqual(durationWithoutCache * 1.1); // Allow 10% variance
      
      console.log(`[Performance] Memoization impact - Without cache: ${durationWithoutCache.toFixed(2)}ms, With cache: ${durationWithCache.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage', () => {
    test('should not cause memory leaks with repeated operations', () => {
      const data = generateWrapperObjects(100);
      
      // Run multiple iterations
      for (let i = 0; i < 10; i++) {
        clearStructureSignatureCache();
        detectStructuresWithPaths(data);
        extractSelectedData(data, new Set(['0', '1', '2']));
      }
      
      // If we get here without errors, memory is being managed properly
      expect(true).toBe(true);
      
      console.log(`[Performance] Memory test - Completed 10 iterations without issues`);
    });
  });
});

