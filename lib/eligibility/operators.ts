// Pure operator evaluation functions — no I/O, no side effects.

export const OPERATOR_ALLOWLIST = [
  'GTE', 'LTE', 'EQ', 'IN', 'ARRAY_INCLUDES', 'ARRAY_CONTAINS_ALL',
  'REQUIRED_TRUE', 'DATE_BEFORE', 'DATE_AFTER', 'TEXT_PRESENT', 'MANUAL_REVIEW',
] as const;

export type Operator = (typeof OPERATOR_ALLOWLIST)[number];

export function isAllowedOperator(op: string): op is Operator {
  return (OPERATOR_ALLOWLIST as readonly string[]).includes(op);
}

export function evaluateGTE(profileValue: unknown, expected: unknown): boolean | null {
  const pv = toNumber(profileValue);
  const ev = toNumber(expected);
  if (pv === null || ev === null) return null;
  return pv >= ev;
}

export function evaluateLTE(profileValue: unknown, expected: unknown): boolean | null {
  const pv = toNumber(profileValue);
  const ev = toNumber(expected);
  if (pv === null || ev === null) return null;
  return pv <= ev;
}

export function evaluateEQ(profileValue: unknown, expected: unknown): boolean | null {
  if (profileValue === null || profileValue === undefined) return null;
  if (expected === null || expected === undefined) return null;
  if (typeof profileValue === 'string' && typeof expected === 'string') {
    return profileValue.trim().toLowerCase() === expected.trim().toLowerCase();
  }
  return profileValue === expected;
}

export function evaluateIN(profileValue: unknown, expected: unknown): boolean | null {
  if (profileValue === null || profileValue === undefined) return null;
  if (!Array.isArray(expected) || expected.length === 0) return null;
  if (typeof profileValue !== 'string' && typeof profileValue !== 'number') return null;
  const lc = expected.map((v: unknown) => typeof v === 'string' ? v.toLowerCase() : v);
  const pv = typeof profileValue === 'string' ? profileValue.toLowerCase() : profileValue;
  return lc.includes(pv);
}

export function evaluateARRAY_INCLUDES(profileArray: unknown, expected: unknown): boolean | null {
  if (!Array.isArray(profileArray) || profileArray.length === 0) return null;
  if (typeof expected !== 'string' && typeof expected !== 'number') return null;
  const lc = profileArray.map((v: unknown) => typeof v === 'string' ? v.toLowerCase() : v);
  const ev = typeof expected === 'string' ? expected.toLowerCase() : expected;
  return lc.includes(ev);
}

export function evaluateARRAY_CONTAINS_ALL(profileArray: unknown, expected: unknown): boolean | null {
  if (!Array.isArray(profileArray)) return null;
  if (!Array.isArray(expected) || expected.length === 0) return null;
  const lcProfile = profileArray.map((v: unknown) => typeof v === 'string' ? v.toLowerCase() : v);
  return expected.every((item: unknown) => {
    const lcItem = typeof item === 'string' ? item.toLowerCase() : item;
    return lcProfile.includes(lcItem);
  });
}

export function evaluateREQUIRED_TRUE(profileValue: unknown, _expected: unknown): boolean | null {
  void _expected;
  if (profileValue === null || profileValue === undefined) return null;
  if (typeof profileValue === 'boolean') return profileValue;
  if (typeof profileValue === 'string') return profileValue.trim().length > 0;
  return null;
}

export function evaluateDATE_BEFORE(profileValue: unknown, expected: unknown): boolean | null {
  const pDate = toDate(profileValue);
  const eDate = toDate(expected);
  if (pDate === null || eDate === null) return null;
  return pDate < eDate;
}

export function evaluateDATE_AFTER(profileValue: unknown, expected: unknown): boolean | null {
  const pDate = toDate(profileValue);
  const eDate = toDate(expected);
  if (pDate === null || eDate === null) return null;
  return pDate > eDate;
}

export function evaluateTEXT_PRESENT(profileValue: unknown, _expected: unknown): boolean | null {
  void _expected;
  if (profileValue === null || profileValue === undefined) return null;
  if (typeof profileValue === 'string') return profileValue.trim().length > 0;
  return null;
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!isFinite(n)) return null;
  return n;
}

function toDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v as string | number);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
