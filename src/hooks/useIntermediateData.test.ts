/// <reference types="jest" />
import { extractSelectedData } from '../utils/dataExtractor';

describe('extractSelectedData', () => {
  describe('when no JSON data is available', () => {
    test('should return null', () => {
      const result = extractSelectedData(null, new Set());
      expect(result).toBeNull();
    });
  });

  describe('when no objects are selected', () => {
    test('should return null', () => {
      const testData = { name: 'test', value: 123 };
      const result = extractSelectedData(testData, new Set());
      expect(result).toBeNull();
    });
  });

  describe('when objects are selected from array data', () => {
    test('should return array of selected values preserving structure', () => {
      const testData = [
        { id: 1, name: 'Item 1', nested: { value: 'a' } },
        { id: 2, name: 'Item 2', nested: { value: 'b' } },
      ];
      const selectedPaths = new Set(['0', '1']);

      const result = extractSelectedData(testData, selectedPaths);

      expect(result).toEqual([
        { id: 1, name: 'Item 1', nested: { value: 'a' } },
        { id: 2, name: 'Item 2', nested: { value: 'b' } },
      ]);
    });
  });

  describe('when objects are selected from nested paths', () => {
    test('should return array of selected nested values', () => {
      const testData = [
        { user: { profile: { name: 'Alice' } } },
        { user: { profile: { name: 'Bob' } } },
      ];
      const selectedPaths = new Set(['0.user.profile', '1.user.profile']);

      const result = extractSelectedData(testData, selectedPaths);

      expect(result).toEqual([
        { name: 'Alice' },
        { name: 'Bob' },
      ]);
    });
  });

  describe('when objects are selected from single object data', () => {
    test('should return array of selected values', () => {
      const testData = { 
        section1: { value: 'a' },
        section2: { value: 'b' },
      };
      const selectedPaths = new Set(['section1', 'section2']);

      const result = extractSelectedData(testData, selectedPaths);

      expect(result).toEqual([
        { value: 'a' },
        { value: 'b' },
      ]);
    });
  });

  describe('when some selected paths return undefined', () => {
    test('should filter out undefined values', () => {
      const testData = { section1: { value: 'a' } };
      const selectedPaths = new Set(['section1', 'nonexistent']);

      const result = extractSelectedData(testData, selectedPaths);

      expect(result).toEqual([
        { value: 'a' },
      ]);
    });
  });
});

