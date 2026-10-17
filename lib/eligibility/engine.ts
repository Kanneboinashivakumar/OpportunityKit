import type { Requirement } from '../schemas/requirement';
import type { AuditStatus } from '../schemas/audit';
import {
  isAllowedOperator,
  evaluateGTE, evaluateLTE, evaluateEQ, evaluateIN,
  evaluateARRAY_INCLUDES, evaluateARRAY_CONTAINS_ALL,
  evaluateREQUIRED_TRUE, evaluateDATE_BEFORE, evaluateDATE_AFTER, evaluateTEXT_PRESENT,
} from './operators';

export const ENGINE_VERSION = '1.0.0';

export interface ProfileSnapshot {
  cgpa?: number | null;
  cgpa_scale?: number | null;
  marks_percentage?: number | null;
  annual_income?: number | null;
  documents?: string[] | null;
  location?: string | null;
  work_authorization?: boolean | null;
  team_size?: number | null;
  skills?: string[] | null;
  skill_gaps?: string[] | null;
  academic_year?: string | null;
  degree?: string | null;
  branch?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  availability_weeks?: number | null;
  [key: string]: unknown;
}

export interface AuditInput {
  requirement: Requirement;
  profile: ProfileSnapshot;
  opportunityId: string;
  ownerId: string;
}

export interface AuditOutput {
  status: AuditStatus;
  reason_code: string;
  explanation: string;
  evaluated_profile_value: unknown;
  next_action: string | null;
}

function getProfileValue(req: Requirement, profile: ProfileSnapshot): unknown {
  const cat = req.category;
  switch (cat) {
    case 'cgpa': return profile.cgpa;
    case 'year': return profile.academic_year;
    case 'branch': return profile.branch;
    case 'academic': return profile.degree;
    case 'skill': return profile.skills;
    case 'github': return profile.github_url;
    case 'portfolio': return profile.portfolio_url;
    case 'availability': return profile.availability_weeks;
    case 'marks': return profile.marks_percentage;
    case 'income': return profile.annual_income;
    case 'document': return profile.documents;
    case 'location': return profile.location;
    case 'work_authorization': return profile.work_authorization;
    case 'team_size': return profile.team_size;
    case 'deadline': return new Date().toISOString();
    default: return null;
  }
}

function missingInfo(reason_code: string, explanation: string, next_action?: string): AuditOutput {
  return { status: 'MISSING_INFO', reason_code, explanation, evaluated_profile_value: null, next_action: next_action ?? null };
}

function match(reason_code: string, explanation: string, profileValue: unknown): AuditOutput {
  return { status: 'MATCH', reason_code, explanation, evaluated_profile_value: profileValue, next_action: null };
}

function mismatch(reason_code: string, explanation: string, profileValue: unknown, next_action?: string | null): AuditOutput {
  return { status: 'MISMATCH', reason_code, explanation, evaluated_profile_value: profileValue, next_action: next_action ?? null };
}

export function auditRequirement(input: AuditInput): AuditOutput {
  const { requirement: req, profile } = input;

  // Safety check: operator must be in allowlist
  if (!isAllowedOperator(req.operator)) {
    return missingInfo('INVALID_OPERATOR', `Operator "${req.operator}" is not recognized. Please review this requirement manually.`);
  }

  // MANUAL_REVIEW: always MISSING_INFO
  if (req.operator === 'MANUAL_REVIEW') {
    return missingInfo('MANUAL_REVIEW', req.notes ?? 'This requirement needs manual review.', 'Review and confirm manually');
  }

  if (req.category === 'skill') {
    const expectedSkills = typeof req.expected_value === 'string'
      ? [req.expected_value]
      : Array.isArray(req.expected_value) && req.expected_value.every((item) => typeof item === 'string')
        ? req.expected_value as string[]
        : [];
    if (expectedSkills.length === 0) {
      return missingInfo('EXPECTED_SKILL_UNCLEAR', 'The required skill is not clear enough to evaluate.', 'Review this requirement manually');
    }
    const knownSkills = new Set((profile.skills ?? []).map((skill) => skill.trim().toLowerCase()));
    const confirmedGaps = new Set((profile.skill_gaps ?? []).map((skill) => skill.trim().toLowerCase()));
    const requiredSkills = expectedSkills.map((skill) => skill.trim().toLowerCase());
    const missing = requiredSkills.filter((skill) => !knownSkills.has(skill));
    if (missing.length === 0) return match('SKILL_CONFIRMED', `Your profile confirms: ${expectedSkills.join(', ')}.`, profile.skills);
    const confirmedMissing = missing.filter((skill) => confirmedGaps.has(skill));
    if (confirmedMissing.length > 0) {
      return mismatch('SKILL_GAP_CONFIRMED', `You confirmed that you do not currently have: ${expectedSkills.filter((skill) => confirmedGaps.has(skill.trim().toLowerCase())).join(', ')}.`, profile.skills, 'This is a confirmed skill gap; consider whether it is addressable before the deadline.');
    }
    return missingInfo('PROFILE_VALUE_MISSING', `Your profile does not say whether you have: ${expectedSkills.filter((skill) => !knownSkills.has(skill.trim().toLowerCase())).join(', ')}.`, 'Confirm whether you have this skill or record it as a current gap in your profile');
  }

  const profileValue = getProfileValue(req, profile);
  const expectedValue = req.expected_value;

  // CGPA normalization
  if (req.category === 'cgpa') {
    const cgpa = typeof profileValue === 'number' ? profileValue : null;
    const scale = typeof profile.cgpa_scale === 'number' && profile.cgpa_scale > 0 ? profile.cgpa_scale : 10;
    const expectedNum = typeof expectedValue === 'number'
      ? expectedValue
      : expectedValue && typeof expectedValue === 'object' && 'value' in expectedValue && typeof expectedValue.value === 'number'
        ? expectedValue.value
        : null;
    const expectedScale = expectedValue && typeof expectedValue === 'object' && 'scale' in expectedValue && typeof expectedValue.scale === 'number'
      ? expectedValue.scale
      : 10;

    if (cgpa === null || cgpa === undefined) {
      return missingInfo('PROFILE_CGPA_MISSING', 'Your CGPA is not set in your profile.', 'Add your CGPA to your profile');
    }
    if (expectedNum === null) {
      return missingInfo('EXPECTED_CGPA_UNCLEAR', 'The required CGPA is not clearly specified in the announcement.', 'Review requirement manually');
    }
    if (!Number.isFinite(cgpa) || !Number.isFinite(scale) || scale <= 0 || cgpa < 0 || cgpa > scale || !Number.isFinite(expectedNum) || !Number.isFinite(expectedScale) || expectedNum < 0 || expectedNum > expectedScale || expectedScale <= 0) {
      return missingInfo('INVALID_CGPA_VALUE', 'The CGPA or its declared scale is invalid. Check the values in your profile and requirement.', 'Correct the CGPA scale or review the requirement manually');
    }

    // Numeric cutoffs default to /10; use { value, scale } when the announcement gives another scale.
    const normalizedCgpa = scale !== 10 ? (cgpa / scale) * 10 : cgpa;
    const normalizedExpected = expectedScale !== 10 ? (expectedNum / expectedScale) * 10 : expectedNum;

    const result = req.operator === 'GTE' ? normalizedCgpa >= normalizedExpected :
                   req.operator === 'LTE' ? normalizedCgpa <= normalizedExpected :
                   req.operator === 'EQ'  ? Math.abs(normalizedCgpa - normalizedExpected) < 0.001 : null;

    if (result === null) return missingInfo('UNSUPPORTED_CGPA_OP', `Operator ${req.operator} is not supported for CGPA.`);
    const expectedLabel = `${expectedNum}/${expectedScale}`;
    if (result) return match('CGPA_MET', `Your CGPA of ${cgpa}/${scale} meets the requirement of ${expectedLabel}.`, cgpa);
    return mismatch('CGPA_NOT_MET', `Your CGPA of ${cgpa}/${scale} does not meet the requirement of ${expectedLabel}.`, cgpa, 'This is a hard constraint that cannot be changed before the deadline');
  }

  // General evaluation
  let result: boolean | null = null;

  switch (req.operator) {
    case 'GTE': result = evaluateGTE(profileValue, expectedValue); break;
    case 'LTE': result = evaluateLTE(profileValue, expectedValue); break;
    case 'EQ': result = evaluateEQ(profileValue, expectedValue); break;
    case 'IN': result = evaluateIN(profileValue, expectedValue); break;
    case 'ARRAY_INCLUDES': result = evaluateARRAY_INCLUDES(profileValue, expectedValue); break;
    case 'ARRAY_CONTAINS_ALL': result = evaluateARRAY_CONTAINS_ALL(profileValue, expectedValue); break;
    case 'REQUIRED_TRUE': result = evaluateREQUIRED_TRUE(profileValue, expectedValue); break;
    case 'DATE_BEFORE': result = evaluateDATE_BEFORE(profileValue, expectedValue); break;
    case 'DATE_AFTER': result = evaluateDATE_AFTER(profileValue, expectedValue); break;
    case 'TEXT_PRESENT': result = evaluateTEXT_PRESENT(profileValue, expectedValue); break;
  }

  if (result === null) {
    return missingInfo(
      'PROFILE_VALUE_MISSING',
      `Your profile does not have enough information to evaluate: ${req.label}`,
      'Update your profile with the missing information'
    );
  }

  if (result) {
    return match(
      'REQUIREMENT_MET',
      `You meet the requirement: ${req.label}`,
      profileValue
    );
  }

  return mismatch(
    'REQUIREMENT_NOT_MET',
    `You do not meet the requirement: ${req.label}`,
    profileValue,
    null
  );
}

export function auditAllRequirements(
  requirements: Requirement[],
  profile: ProfileSnapshot,
  opportunityId: string,
  ownerId: string
): Array<AuditOutput & { requirement_id: string; opportunity_id: string; owner_id: string; engine_version: string; evaluated_at: string }> {
  return requirements.map((req) => {
    const output = auditRequirement({ requirement: req, profile, opportunityId, ownerId });
    return {
      ...output,
      requirement_id: req.id,
      opportunity_id: opportunityId,
      owner_id: ownerId,
      engine_version: ENGINE_VERSION,
      evaluated_at: new Date().toISOString(),
    };
  });
}
