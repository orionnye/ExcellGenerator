/// <reference types="jest" />
import { extractSelectedData } from './dataExtractor';

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
    test('should return array of selected values', () => {
      const testData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];
      const selectedPaths = new Set(['0', '1']);

      const result = extractSelectedData(testData, selectedPaths);

      expect(result).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]);
    });

    test('should filter out undefined values', () => {
      const testData = [{ id: 1 }];
      const selectedPaths = new Set(['0', 'nonexistent']);

      const result = extractSelectedData(testData, selectedPaths);

      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('when objects are selected from nested paths in array', () => {
    test('should return array of nested values', () => {
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

  describe('when selected paths return primitives', () => {
    test('should include primitive values in result', () => {
      const testData = { name: 'test', count: 42 };
      const selectedPaths = new Set(['name', 'count']);

      const result = extractSelectedData(testData, selectedPaths);

      expect(result).toEqual(['test', 42]);
    });
  });

  describe('when selected paths return mixed types', () => {
    test('should include all types in result', () => {
      const testData = {
        string: 'text',
        number: 123,
        object: { key: 'value' },
        array: [1, 2, 3],
      };
      const selectedPaths = new Set(['string', 'number', 'object', 'array']);

      const result = extractSelectedData(testData, selectedPaths);

      expect(result).toEqual([
        'text',
        123,
        { key: 'value' },
        [1, 2, 3],
      ]);
    });
  });

  describe('wrapper object behavior - with auto-extraction', () => {
    test('should auto-extract nested value when wrapper object is selected', () => {
      // New behavior - automatically unwraps wrapper objects
      const testData = [
        { dateTime: '10/18/24 07:00:03', value: { bpm: 65, confidence: 2 } },
      ];
      const selectedPaths = new Set(['0']);

      const result = extractSelectedData(testData, selectedPaths);

      // New behavior: automatically extracts nested value property
      expect(result).toEqual([
        { bpm: 65, confidence: 2 },
      ]);
    });

    test('should extract nested value when nested path is selected', () => {
      // This works - user can select nested path directly
      const testData = [
        { dateTime: '10/18/24 07:00:03', value: { bpm: 65, confidence: 2 } },
      ];
      const selectedPaths = new Set(['0.value']);

      const result = extractSelectedData(testData, selectedPaths);

      // This works correctly
      expect(result).toEqual([
        { bpm: 65, confidence: 2 },
      ]);
    });

    test('should extract flat object when flat structure is selected', () => {
      // This is the working case
      const testData = [
        { logId: 48899279832, activityName: 'Walk', activityTypeId: 90013 },
      ];
      const selectedPaths = new Set(['0']);

      const result = extractSelectedData(testData, selectedPaths);

      // Works correctly for flat objects (no wrapper pattern, so no extraction)
      expect(result).toEqual([
        { logId: 48899279832, activityName: 'Walk', activityTypeId: 90013 },
      ]);
    });

    test('should handle multiple wrapper objects in array', () => {
      const testData = [
        { dateTime: '10/18/24 07:00:03', value: { bpm: 65, confidence: 2 } },
        { dateTime: '10/18/24 08:00:03', value: { bpm: 70, confidence: 3 } },
      ];
      const selectedPaths = new Set(['0', '1']);

      const result = extractSelectedData(testData, selectedPaths);

      expect(result).toEqual([
        { bpm: 65, confidence: 2 },
        { bpm: 70, confidence: 3 },
      ]);
    });

    test('should handle mixed wrapper and flat objects', () => {
      const testData = [
        { dateTime: '10/18/24 07:00:03', value: { bpm: 65 } },
        { logId: 48899279832, activityName: 'Walk' },
      ];
      const selectedPaths = new Set(['0', '1']);

      const result = extractSelectedData(testData, selectedPaths);

      expect(result).toEqual([
        { bpm: 65 }, // Wrapper extracted
        { logId: 48899279832, activityName: 'Walk' }, // Flat object unchanged
      ]);
    });

    test('should not extract when wrapper detection is ambiguous', () => {
      const testData = [
        { metadata: { version: 1 }, details: { text: 'hello' }, info: { id: 1 } },
      ];
      const selectedPaths = new Set(['0']);

      const result = extractSelectedData(testData, selectedPaths);

      // Should return original object when ambiguous
      expect(result).toEqual([
        { metadata: { version: 1 }, details: { text: 'hello' }, info: { id: 1 } },
      ]);
    });
  });
});
