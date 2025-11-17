/// <reference types="jest" />
import { getMemoizedStructureSignature, clearStructureSignatureCache } from './structureSignatureMemoizer';

describe('getMemoizedStructureSignature', () => {
  beforeEach(() => {
    clearStructureSignatureCache();
  });

  describe('when computing structure signatures', () => {
    test('should return same signature for identical objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 2, a: 1 }; // Same keys, different order
      
      const sig1 = getMemoizedStructureSignature(obj1);
      const sig2 = getMemoizedStructureSignature(obj2);
      
      expect(sig1).toBe(sig2);
      expect(sig1).toBe('a|b');
    });

    test('should cache results for repeated calls', () => {
      const obj = { dateTime: 'test', value: { bpm: 65 } };
      
      const sig1 = getMemoizedStructureSignature(obj);
      const sig2 = getMemoizedStructureSignature(obj);
      
      // Should be the same reference (cached)
      expect(sig1).toBe(sig2);
    });

    test('should handle arrays', () => {
      const arr1 = [{ id: 1 }, { id: 2 }];
      const arr2 = [{ id: 3 }, { id: 4 }];
      
      const sig1 = getMemoizedStructureSignature(arr1);
      const sig2 = getMemoizedStructureSignature(arr2);
      
      // Arrays with same structure should have same signature
      expect(sig1).toBe(sig2);
      expect(sig1).toContain('id');
    });

    test('should handle empty arrays', () => {
      const arr: any[] = [];
      const sig = getMemoizedStructureSignature(arr);
      
      expect(sig).toBe('[]');
    });

    test('should handle null and undefined', () => {
      expect(getMemoizedStructureSignature(null)).toBe('');
      expect(getMemoizedStructureSignature(undefined)).toBe('');
    });

    test('should handle primitive values', () => {
      expect(getMemoizedStructureSignature(123)).toBe('number');
      expect(getMemoizedStructureSignature('test')).toBe('string');
      expect(getMemoizedStructureSignature(true)).toBe('boolean');
    });

    test('should handle nested objects', () => {
      const obj = {
        dateTime: 'test',
        value: {
          bpm: 65,
          confidence: 2,
        },
      };
      
      const sig = getMemoizedStructureSignature(obj);
      expect(sig).toBe('dateTime|value');
    });
  });

  describe('when cache is cleared', () => {
    test('should recompute signatures after clearing', () => {
      const obj = { a: 1, b: 2 };
      
      const sig1 = getMemoizedStructureSignature(obj);
      clearStructureSignatureCache();
      const sig2 = getMemoizedStructureSignature(obj);
      
      // Should still return same value, but cache was cleared
      expect(sig1).toBe(sig2);
      expect(sig1).toBe('a|b');
    });
  });

  describe('performance with large arrays', () => {
    test('should efficiently handle arrays with many identical objects', () => {
      const largeArray = Array.from({ length: 1000 }, () => ({
        dateTime: 'test',
        value: { bpm: 65, confidence: 2 },
      }));
      
      const start = performance.now();
      largeArray.forEach(obj => getMemoizedStructureSignature(obj));
      const end = performance.now();
      
      const duration = end - start;
      
      // Should complete in reasonable time (< 100ms for 1000 items)
      expect(duration).toBeLessThan(100);
      
      // Verify all signatures are the same (cached)
      const signatures = largeArray.map(obj => getMemoizedStructureSignature(obj));
      const uniqueSignatures = new Set(signatures);
      expect(uniqueSignatures.size).toBe(1);
    });
  });
});

