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

function parseWeeks(val: unknown): number | null {
  if (typeof val === 'number' && Number.isFinite(val)) return Math.round(val);
  if (typeof val !== 'string') return null;
  const s = val.trim().toLowerCase();
  const monthMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:month|mo|m\b)/);
  if (monthMatch) return Math.round(parseFloat(monthMatch[1]) * 4.33);
  const weekMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:week|wk|w\b)/);
  if (weekMatch) return Math.round(parseFloat(weekMatch[1]));
  const num = parseFloat(s);
  return !isNaN(num) && isFinite(num) ? Math.round(num) : null;
}

function normalizeSkill(s: string): string {
  const clean = s.trim().toLowerCase();
  const map: Record<string, string> = {
    'react.js': 'react',
    'reactjs': 'react',
    'node.js': 'nodejs',
    'node': 'nodejs',
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'python3': 'python',
    'postgres': 'postgresql',
    'mongo': 'mongodb',
    'k8s': 'kubernetes',
    'c++': 'cpp',
    'c#': 'csharp',
  };
  return map[clean] || clean.replace(/[^a-z0-9]/g, '');
}

function skillsMatch(profileSkill: string, reqSkill: string): boolean {
  const p = profileSkill.trim().toLowerCase();
  const r = reqSkill.trim().toLowerCase();
  if (p === r) return true;
  const np = normalizeSkill(p);
  const nr = normalizeSkill(r);
  if (np && nr && (np === nr || np.includes(nr) || nr.includes(np))) return true;
  return false;
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

  // Availability / Duration matching (e.g. 4 months requirement vs 6 months availability)
  if (req.category === 'availability') {
    const profileWeeks = parseWeeks(profile.availability_weeks ?? (profile as any).preferences?.availability_weeks);
    const reqWeeks = parseWeeks(req.expected_value) ?? parseWeeks(req.label);

    if (profileWeeks === null) {
      return missingInfo('PROFILE_AVAILABILITY_MISSING', 'Your profile does not specify your availability.', 'Add your availability in your profile');
    }
    if (reqWeeks === null) {
      return missingInfo('EXPECTED_AVAILABILITY_UNCLEAR', 'The required duration is not clearly specified in the announcement.', 'Review requirement manually');
    }

    if (profileWeeks >= reqWeeks) {
      return match(
        'AVAILABILITY_MET',
        `Your availability of ${profileWeeks} weeks (~${Math.round(profileWeeks / 4.33)} months) meets or exceeds the required ${reqWeeks} weeks (~${Math.round(reqWeeks / 4.33)} months).`,
        profileWeeks
      );
    }
    return mismatch(
      'AVAILABILITY_SHORT',
      `The opportunity requires at least ${reqWeeks} weeks of availability (~${Math.round(reqWeeks / 4.33)} months), but your profile indicates ${profileWeeks} weeks.`,
      profileWeeks,
      'Check if your schedule allows for a longer commitment before applying.'
    );
  }

  // Skills matching
  if (req.category === 'skill') {
    let expectedSkills: string[] = [];
    if (typeof req.expected_value === 'string' && req.expected_value.trim()) {
      expectedSkills = [req.expected_value.trim()];
    } else if (Array.isArray(req.expected_value)) {
      expectedSkills = req.expected_value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    } else if (req.label) {
      // Fallback: extract from label
      expectedSkills = [req.label.replace(/^skill:\s*/i, '').trim()];
    }

    if (expectedSkills.length === 0) {
      return missingInfo('EXPECTED_SKILL_UNCLEAR', 'The required skill is not clear enough to evaluate.', 'Review this requirement manually');
    }

    const pSkills = profile.skills ?? [];
    if (pSkills.length === 0) {
      return missingInfo('PROFILE_VALUE_MISSING', 'Your profile has no technical skills listed yet.', 'Add your skills in your profile');
    }

    const confirmedGaps = new Set((profile.skill_gaps ?? []).map((s) => s.trim().toLowerCase()));

    // Check if each expected skill is satisfied
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const es of expectedSkills) {
      const found = pSkills.some((ps) => skillsMatch(ps, es));
      if (found) {
        matchedSkills.push(es);
      } else {
        missingSkills.push(es);
      }
    }

    if (missingSkills.length === 0) {
      return match('SKILL_CONFIRMED', `Your profile confirms verified skill: ${expectedSkills.join(', ')}.`, pSkills);
    }

    const hasConfirmedGap = missingSkills.some((s) => confirmedGaps.has(s.trim().toLowerCase()));
    if (hasConfirmedGap) {
      return mismatch(
        'SKILL_GAP_CONFIRMED',
        `You confirmed that you do not currently have: ${missingSkills.join(', ')}.`,
        pSkills,
        'This is a confirmed skill gap; consider whether it is addressable before the deadline.'
      );
    }

    return missingInfo(
      'PROFILE_VALUE_MISSING',
      `Your profile does not say whether you have: ${missingSkills.join(', ')}.`,
      'Confirm whether you have this skill or record it as a current gap in your profile'
    );
  }

  // Academic Degree Program matching (e.g. B.Tech, B.E., M.Tech)
  if (req.category === 'academic') {
    const studentDegree = profile.degree?.trim();
    if (!studentDegree) {
      return missingInfo('PROFILE_DEGREE_MISSING', 'Your degree program is not set in your profile.', 'Add your degree in your profile');
    }

    const exp = req.expected_value;
    const reqStr = typeof exp === 'string' ? exp : Array.isArray(exp) ? exp.join(' ') : req.label;
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    const sd = norm(studentDegree);
    const rd = norm(reqStr);

    const matchesDegree = rd.includes(sd) || sd.includes(rd) ||
      (sd.includes('btech') && rd.includes('be')) ||
      (sd.includes('be') && rd.includes('btech')) ||
      rd.includes('any') || rd.includes('all');

    if (matchesDegree) {
      return match('DEGREE_MET', `Your degree (${studentDegree}) satisfies the requirement (${req.label}).`, studentDegree);
    }
    return mismatch('DEGREE_NOT_MET', `Opportunity requires ${reqStr}, but your degree is ${studentDegree}.`, studentDegree, 'Verify whether equivalent degrees are accepted.');
  }

  // Branch matching (e.g. Computer Science, IT)
  if (req.category === 'branch') {
    const studentBranch = profile.branch?.trim();
    if (!studentBranch) {
      return missingInfo('PROFILE_BRANCH_MISSING', 'Your branch/major is not set in your profile.', 'Add your branch in your profile');
    }

    const exp = req.expected_value;
    const reqStr = typeof exp === 'string' ? exp : Array.isArray(exp) ? exp.join(' ') : req.label;
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    const sb = norm(studentBranch);
    const rb = norm(reqStr);

    const matchesBranch = rb.includes(sb) || sb.includes(rb) ||
      (sb.includes('cs') && (rb.includes('cs') || rb.includes('computer'))) ||
      (sb.includes('computer') && (rb.includes('cs') || rb.includes('it') || rb.includes('computer'))) ||
      rb.includes('any') || rb.includes('all') || rb.includes('open');

    if (matchesBranch) {
      return match('BRANCH_MET', `Your branch (${studentBranch}) satisfies the requirement (${req.label}).`, studentBranch);
    }
    return mismatch('BRANCH_NOT_MET', `Opportunity requires branch ${reqStr}, but your profile lists ${studentBranch}.`, studentBranch, 'Check if other branches are eligible.');
  }

  // Document matching (Resume / CV)
  if (req.category === 'document') {
    const labelLow = req.label.toLowerCase();
    if (labelLow.includes('resume') || labelLow.includes('cv')) {
      if (profile.full_name) {
        return match('RESUME_ON_FILE', 'You have an active student profile with your verified credentials on file.', true);
      }
      return missingInfo('RESUME_MISSING', 'A resume is required for this application.', 'Complete your profile with your resume details');
    }
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
