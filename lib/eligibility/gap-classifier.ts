import type { AuditOutput } from './engine';
import type { Requirement } from '../schemas/requirement';

export type GapClassification = 'PROFILE_OMISSION' | 'TIME_SENSITIVE_GAP' | 'HARD_BLOCKER' | 'UNKNOWN';

export interface ClassifiedGap {
  requirement: Requirement;
  audit: AuditOutput;
  classification: GapClassification;
  classificationReason: string;
}

const HARD_BLOCKER_CATEGORIES = new Set(['cgpa', 'academic', 'year', 'branch', 'work_authorization']);

export function classifyGap(
  requirement: Requirement,
  audit: AuditOutput,
  deadlineDays?: number | null
): ClassifiedGap {
  let classification: GapClassification = 'UNKNOWN';
  let classificationReason = '';

  if (audit.status === 'MISSING_INFO') {
    // Profile omission: data might exist but isn't recorded
    if (
      audit.reason_code === 'PROFILE_VALUE_MISSING' ||
      audit.reason_code === 'PROFILE_CGPA_MISSING'
    ) {
      classification = 'PROFILE_OMISSION';
      classificationReason =
        'This information may exist but is not in your profile. Update your profile to resolve this.';
    } else {
      classification = 'UNKNOWN';
      classificationReason =
        'Insufficient information to classify this gap. Review manually.';
    }
  } else if (audit.status === 'MISMATCH') {
    if (HARD_BLOCKER_CATEGORIES.has(requirement.category)) {
      classification = 'HARD_BLOCKER';
      classificationReason =
        'This is a non-negotiable eligibility condition. It cannot be resolved before the deadline.';
    } else if (requirement.category === 'skill') {
      const timeLeft = deadlineDays ?? null;
      if (timeLeft !== null && timeLeft > 0) {
        classification = 'TIME_SENSITIVE_GAP';
        classificationReason =
          'There is time before the deadline, but whether this skill gap is addressable depends on your situation. No learning outcome is guaranteed.';
      } else {
        classification = 'UNKNOWN';
        classificationReason =
          'There is not enough deadline information to decide whether this skill gap is addressable. Review it manually.';
      }
    } else {
      const addressableCategories = new Set(['document', 'portfolio', 'github', 'availability']);
      if (addressableCategories.has(requirement.category) && typeof deadlineDays === 'number' && deadlineDays > 0) {
        classification = 'TIME_SENSITIVE_GAP';
        classificationReason = 'This may be addressable before the deadline; review the work and time required before deciding.';
      } else {
        classification = 'UNKNOWN';
        classificationReason = 'There is not enough information to determine whether this mismatch is addressable. Review it manually.';
      }
    }
  }

  return { requirement, audit, classification, classificationReason };
}
