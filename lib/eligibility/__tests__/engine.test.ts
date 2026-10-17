import { describe, it, expect } from 'vitest';
import { auditRequirement, type ProfileSnapshot } from '../engine';
import type { Requirement } from '../../schemas/requirement';

function makeReq(overrides: Partial<Requirement>): Requirement {
  return {
    id: 'req-1',
    opportunity_id: 'opp-1',
    owner_id: 'user-1',
    category: 'cgpa',
    label: 'Minimum CGPA 7.5',
    operator: 'GTE',
    expected_value: 7.5,
    required: true,
    needs_review: false,
    sort_order: 0,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

const baseProfile: ProfileSnapshot = {
  cgpa: 8.5,
  cgpa_scale: 10,
  skills: ['Python', 'React', 'Machine Learning'],
  academic_year: '3rd year',
  branch: 'Computer Science',
  degree: 'B.Tech',
  github_url: 'https://github.com/testuser',
  portfolio_url: '',
  availability_weeks: 8,
};

describe('auditRequirement — CGPA', () => {
  it('returns MATCH when CGPA meets GTE requirement', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'cgpa', operator: 'GTE', expected_value: 7.5 }),
      profile: { ...baseProfile, cgpa: 8.5 },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MATCH');
  });

  it('returns MISMATCH when CGPA fails GTE requirement', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'cgpa', operator: 'GTE', expected_value: 9.0 }),
      profile: { ...baseProfile, cgpa: 8.5 },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MISMATCH');
  });

  it('returns MISSING_INFO when CGPA is not in profile', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'cgpa', operator: 'GTE', expected_value: 7.5 }),
      profile: { ...baseProfile, cgpa: null },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MISSING_INFO');
    expect(result.reason_code).toBe('PROFILE_CGPA_MISSING');
  });

  it('returns MATCH at the exact boundary (7.5 >= 7.5)', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'cgpa', operator: 'GTE', expected_value: 7.5 }),
      profile: { ...baseProfile, cgpa: 7.5 },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MATCH');
  });

  it('normalizes an explicitly declared 4-point CGPA requirement', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'cgpa', operator: 'GTE', expected_value: { value: 3, scale: 4 } }),
      profile: { ...baseProfile, cgpa: 7.5, cgpa_scale: 10 },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MATCH');
  });
});

describe('auditRequirement — Skills', () => {
  it('returns MATCH when required skill is present', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'skill', operator: 'ARRAY_INCLUDES', expected_value: 'Python' }),
      profile: { ...baseProfile, skills: ['Python', 'React'] },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MATCH');
  });

  it('returns MISSING_INFO (not MISMATCH) when skills array is empty', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'skill', operator: 'ARRAY_INCLUDES', expected_value: 'Python' }),
      profile: { ...baseProfile, skills: [] },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MISSING_INFO');
  });

  it('returns MISSING_INFO when a listed skill is absent but no gap was confirmed', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'skill', operator: 'ARRAY_INCLUDES', expected_value: 'Java' }),
      profile: { ...baseProfile, skills: ['Python', 'React'] },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MISSING_INFO');
  });

  it('returns MISMATCH only when the user explicitly confirms the skill gap', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'skill', operator: 'ARRAY_INCLUDES', expected_value: 'Java' }),
      profile: { ...baseProfile, skills: ['Python'], skill_gaps: ['Java'] },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MISMATCH');
  });
});

describe('auditRequirement — MANUAL_REVIEW', () => {
  it('always returns MISSING_INFO for MANUAL_REVIEW operator', () => {
    const result = auditRequirement({
      requirement: makeReq({ operator: 'MANUAL_REVIEW', notes: 'Check citizenship status' }),
      profile: baseProfile,
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MISSING_INFO');
    expect(result.reason_code).toBe('MANUAL_REVIEW');
  });
});

describe('auditRequirement — Invalid operator', () => {
  it('returns MISSING_INFO for disallowed operators (safety)', () => {
    const result = auditRequirement({
      requirement: makeReq({ operator: 'eval' as never }),
      profile: baseProfile,
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MISSING_INFO');
    expect(result.reason_code).toBe('INVALID_OPERATOR');
  });
});

describe('auditRequirement — GitHub', () => {
  it('returns MATCH when github_url is present', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'github', operator: 'REQUIRED_TRUE', expected_value: null }),
      profile: { ...baseProfile, github_url: 'https://github.com/user' },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MATCH');
  });

  it('returns MISSING_INFO when github_url is not set', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'github', operator: 'REQUIRED_TRUE', expected_value: null }),
      profile: { ...baseProfile, github_url: null },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MISSING_INFO');
  });
});

describe('auditRequirement — Branch', () => {
  it('returns MATCH for EQ branch match', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'branch', operator: 'EQ', expected_value: 'computer science' }),
      profile: { ...baseProfile, branch: 'Computer Science' },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MATCH');
  });

  it('returns MISMATCH for EQ branch mismatch', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'branch', operator: 'EQ', expected_value: 'Mechanical Engineering' }),
      profile: { ...baseProfile, branch: 'Computer Science' },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MISMATCH');
  });

  it('returns MISSING_INFO when branch is not set', () => {
    const result = auditRequirement({
      requirement: makeReq({ category: 'branch', operator: 'EQ', expected_value: 'CS' }),
      profile: { ...baseProfile, branch: null },
      opportunityId: 'opp-1',
      ownerId: 'user-1',
    });
    expect(result.status).toBe('MISSING_INFO');
  });
});
