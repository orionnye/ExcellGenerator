/// <reference types="jest" />
import { detectWrapperProperty, extractWrapperData } from './wrapperDetector';

describe('detectWrapperProperty', () => {
  describe('when object has wrapper pattern', () => {
    test('should detect "value" property as wrapper', () => {
      const obj = { dateTime: '10/18/24 07:00:03', value: { bpm: 65, confidence: 2 } };
      const result = detectWrapperProperty(obj);
      expect(result).toBe('value');
    });

    test('should detect "data" property as wrapper', () => {
      const obj = { timestamp: 123456, data: { id: 1, name: 'test' } };
      const result = detectWrapperProperty(obj);
      expect(result).toBe('data');
    });

    test('should detect "result" property as wrapper', () => {
      const obj = { status: 'ok', result: { items: [1, 2, 3] } };
      const result = detectWrapperProperty(obj);
      expect(result).toBe('result');
    });

    test('should detect "payload" property as wrapper', () => {
      const obj = { meta: 'info', payload: { key: 'value' } };
      const result = detectWrapperProperty(obj);
      expect(result).toBe('payload');
    });
  });

  describe('when object has multiple nested object properties', () => {
    test('should return null when ambiguous', () => {
      const obj = { 
        metadata: { version: 1 },
        value: { bpm: 65 },
        data: { id: 1 }
      };
      const result = detectWrapperProperty(obj);
      expect(result).toBeNull();
    });
  });

  describe('when object has single nested object property', () => {
    test('should detect it even if not in common patterns list', () => {
      const obj = { timestamp: 123, content: { text: 'hello' } };
      const result = detectWrapperProperty(obj);
      // Should detect single nested object property
      expect(result).toBe('content');
    });
  });

  describe('when object has no nested object properties', () => {
    test('should return null for flat object', () => {
      const obj = { logId: 48899279832, activityName: 'Walk', activityTypeId: 90013 };
      const result = detectWrapperProperty(obj);
      expect(result).toBeNull();
    });

    test('should return null for object with only primitives', () => {
      const obj = { name: 'test', count: 42, active: true };
      const result = detectWrapperProperty(obj);
      expect(result).toBeNull();
    });
  });

  describe('when object has nested array property matching common pattern', () => {
    test('should detect array property as wrapper if it matches common pattern', () => {
      const obj = { dateTime: '10/18/24', data: [{ id: 1 }, { id: 2 }] };
      const result = detectWrapperProperty(obj);
      expect(result).toBe('data');
    });

    test('should not detect array property if it does not match common pattern', () => {
      const obj = { dateTime: '10/18/24', items: [{ id: 1 }, { id: 2 }] };
      const result = detectWrapperProperty(obj);
      // "items" is not a common wrapper pattern, so should return null
      expect(result).toBeNull();
    });
  });

  describe('when object is empty or invalid', () => {
    test('should return null for empty object', () => {
      const obj = {};
      const result = detectWrapperProperty(obj);
      expect(result).toBeNull();
    });

    test('should return null for null', () => {
      const result = detectWrapperProperty(null);
      expect(result).toBeNull();
    });

    test('should return null for array', () => {
      const result = detectWrapperProperty([1, 2, 3]);
      expect(result).toBeNull();
    });
  });
});

describe('extractWrapperData', () => {
  describe('when object has wrapper pattern', () => {
    test('should extract nested value property', () => {
      const obj = { dateTime: '10/18/24 07:00:03', value: { bpm: 65, confidence: 2 } };
      const result = extractWrapperData(obj);
      expect(result).toEqual({ bpm: 65, confidence: 2 });
    });

    test('should extract nested data property', () => {
      const obj = { timestamp: 123, data: { id: 1 } };
      const result = extractWrapperData(obj);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('when object has no wrapper pattern', () => {
    test('should return original object', () => {
      const obj = { logId: 48899279832, activityName: 'Walk' };
      const result = extractWrapperData(obj);
      expect(result).toBe(obj);
    });
  });

  describe('when wrapper detection is ambiguous', () => {
    test('should return original object when multiple nested properties but none match common patterns', () => {
      const obj = { 
        metadata: { version: 1 },
        details: { text: 'hello' },
        info: { id: 1 }
      };
      const result = extractWrapperData(obj);
      expect(result).toBe(obj);
    });

    test('should extract common wrapper pattern even when other nested properties exist', () => {
      const obj = { 
        metadata: { version: 1 },
        value: { bpm: 65 }
      };
      const result = extractWrapperData(obj);
      // Should extract "value" because it matches common pattern
      expect(result).toEqual({ bpm: 65 });
    });
  });
});

