import { describe, it, expect } from 'vitest';
import {
  evaluateGTE, evaluateLTE, evaluateEQ, evaluateIN,
  evaluateARRAY_INCLUDES, evaluateARRAY_CONTAINS_ALL,
  evaluateREQUIRED_TRUE, evaluateDATE_BEFORE, evaluateDATE_AFTER,
  evaluateTEXT_PRESENT, isAllowedOperator,
} from '../operators';

describe('Operators', () => {
  describe('isAllowedOperator', () => {
    it('returns true for valid operators', () => {
      expect(isAllowedOperator('GTE')).toBe(true);
      expect(isAllowedOperator('MANUAL_REVIEW')).toBe(true);
    });
    it('returns false for arbitrary strings', () => {
      expect(isAllowedOperator('eval')).toBe(false);
      expect(isAllowedOperator('exec')).toBe(false);
      expect(isAllowedOperator('')).toBe(false);
    });
  });

  describe('GTE', () => {
    it('returns true when profile value >= expected', () => {
      expect(evaluateGTE(8.5, 7.0)).toBe(true);
      expect(evaluateGTE(7.0, 7.0)).toBe(true);
    });
    it('returns false when profile value < expected', () => {
      expect(evaluateGTE(6.9, 7.0)).toBe(false);
    });
    it('returns null for missing values', () => {
      expect(evaluateGTE(null, 7.0)).toBeNull();
      expect(evaluateGTE(8.0, null)).toBeNull();
      expect(evaluateGTE(undefined, 7.0)).toBeNull();
      expect(evaluateGTE('', 7.0)).toBeNull();
    });
    it('returns null for non-numeric values', () => {
      expect(evaluateGTE('abc', 7.0)).toBeNull();
      expect(evaluateGTE(NaN, 7.0)).toBeNull();
    });
  });

  describe('LTE', () => {
    it('returns true when profile value <= expected', () => {
      expect(evaluateLTE(5.0, 7.0)).toBe(true);
      expect(evaluateLTE(7.0, 7.0)).toBe(true);
    });
    it('returns false when profile value > expected', () => {
      expect(evaluateLTE(7.1, 7.0)).toBe(false);
    });
    it('returns null for missing values', () => {
      expect(evaluateLTE(null, 5.0)).toBeNull();
    });
  });

  describe('EQ', () => {
    it('matches strings case-insensitively', () => {
      expect(evaluateEQ('B.Tech', 'b.tech')).toBe(true);
      expect(evaluateEQ('  CS  ', 'cs')).toBe(true);
    });
    it('returns false for different strings', () => {
      expect(evaluateEQ('B.Tech', 'M.Tech')).toBe(false);
    });
    it('returns null for missing values', () => {
      expect(evaluateEQ(null, 'B.Tech')).toBeNull();
      expect(evaluateEQ(undefined, 'B.Tech')).toBeNull();
    });
  });

  describe('IN', () => {
    it('returns true when value is in array', () => {
      expect(evaluateIN('CS', ['CS', 'IT', 'ECE'])).toBe(true);
      expect(evaluateIN('cs', ['CS', 'IT'])).toBe(true);
    });
    it('returns false when value is not in array', () => {
      expect(evaluateIN('Mech', ['CS', 'IT'])).toBe(false);
    });
    it('returns null for empty or invalid expected', () => {
      expect(evaluateIN('CS', [])).toBeNull();
      expect(evaluateIN(null, ['CS'])).toBeNull();
    });
  });

  describe('ARRAY_INCLUDES', () => {
    it('returns true when profile array includes expected skill', () => {
      expect(evaluateARRAY_INCLUDES(['Python', 'React', 'ML'], 'python')).toBe(true);
    });
    it('returns false when skill is missing', () => {
      expect(evaluateARRAY_INCLUDES(['Python', 'React'], 'java')).toBe(false);
    });
    it('returns null for empty profile array', () => {
      expect(evaluateARRAY_INCLUDES([], 'python')).toBeNull();
      expect(evaluateARRAY_INCLUDES(null, 'python')).toBeNull();
    });
  });

  describe('ARRAY_CONTAINS_ALL', () => {
    it('returns true when all expected skills are present', () => {
      expect(evaluateARRAY_CONTAINS_ALL(['Python', 'React', 'Node'], ['python', 'react'])).toBe(true);
    });
    it('returns false when any expected skill is missing', () => {
      expect(evaluateARRAY_CONTAINS_ALL(['Python', 'React'], ['python', 'java'])).toBe(false);
    });
    it('returns null for null profile array', () => {
      expect(evaluateARRAY_CONTAINS_ALL(null, ['python'])).toBeNull();
    });
  });

  describe('REQUIRED_TRUE', () => {
    it('returns true for non-empty string', () => {
      expect(evaluateREQUIRED_TRUE('https://github.com/user', null)).toBe(true);
    });
    it('returns true for true boolean', () => {
      expect(evaluateREQUIRED_TRUE(true, null)).toBe(true);
    });
    it('returns false for false boolean', () => {
      expect(evaluateREQUIRED_TRUE(false, null)).toBe(false);
    });
    it('returns null for null/undefined', () => {
      expect(evaluateREQUIRED_TRUE(null, null)).toBeNull();
      expect(evaluateREQUIRED_TRUE(undefined, null)).toBeNull();
    });
    it('returns false for empty string', () => {
      expect(evaluateREQUIRED_TRUE('', null)).toBe(false);
    });
  });

  describe('DATE_BEFORE', () => {
    it('returns true when profile date is before expected', () => {
      expect(evaluateDATE_BEFORE('2024-01-01', '2024-12-31')).toBe(true);
    });
    it('returns false when profile date is after expected', () => {
      expect(evaluateDATE_BEFORE('2025-01-01', '2024-12-31')).toBe(false);
    });
    it('returns null for invalid dates', () => {
      expect(evaluateDATE_BEFORE(null, '2024-12-31')).toBeNull();
      expect(evaluateDATE_BEFORE('not-a-date', '2024-12-31')).toBeNull();
    });
  });

  describe('DATE_AFTER', () => {
    it('returns true when profile date is after expected', () => {
      expect(evaluateDATE_AFTER('2025-01-01', '2024-12-31')).toBe(true);
    });
    it('returns false when profile date is before expected', () => {
      expect(evaluateDATE_AFTER('2023-01-01', '2024-12-31')).toBe(false);
    });
  });

  describe('TEXT_PRESENT', () => {
    it('returns true for non-empty string', () => {
      expect(evaluateTEXT_PRESENT('some text', null)).toBe(true);
    });
    it('returns false for empty string', () => {
      expect(evaluateTEXT_PRESENT('  ', null)).toBe(false);
    });
    it('returns null for null/undefined', () => {
      expect(evaluateTEXT_PRESENT(null, null)).toBeNull();
    });
  });
});
