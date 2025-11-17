/// <reference types="jest" />
import { detectStructuresWithPaths } from './structurePathDetector';

describe('detectStructuresWithPaths', () => {
  describe('when root is array of wrapper objects', () => {
    test('should detect root-level array items as selectable', () => {
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
      ];

      const result = detectStructuresWithPaths(data);

      // Should detect paths "0" and "1" for root-level items
      const rootPaths = result.filter(r => r.path === '0' || r.path === '1');
      expect(rootPaths.length).toBe(2);
      expect(rootPaths[0].path).toBe('0');
      expect(rootPaths[1].path).toBe('1');
      expect(rootPaths[0].structure).toBe('dateTime|value');
      expect(rootPaths[0].isDuplicate).toBe(true);
      expect(rootPaths[0].isFirstOfType).toBe(true);
    });
  });

  describe('when root is array of flat objects', () => {
    test('should detect root-level array items as selectable', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];

      const result = detectStructuresWithPaths(data);

      const rootPaths = result.filter(r => r.path === '0' || r.path === '1');
      expect(rootPaths.length).toBe(2);
      expect(rootPaths[0].path).toBe('0');
      expect(rootPaths[1].path).toBe('1');
    });
  });
});

