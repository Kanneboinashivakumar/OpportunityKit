import type { Requirement } from '../schemas/requirement';
import type { AuditOutput } from './engine';
import { classifyGap } from './gap-classifier';
import { daysUntil } from '../utils';

export interface ActionItem {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_at?: string | null;
}

export function generateActionPlan(
  requirements: Requirement[],
  auditResults: AuditOutput[],
  deadline: string | null | undefined
): ActionItem[] {
  const days = deadline ? daysUntil(deadline) : null;
  const items: ActionItem[] = [];

  requirements.forEach((req, idx) => {
    const audit = auditResults[idx];
    if (!audit) return;

    if (audit.status === 'MATCH') return; // No action needed

    const gap = classifyGap(req, audit, days);

    if (audit.status === 'MISSING_INFO') {
      if (gap.classification === 'PROFILE_OMISSION') {
        items.push({
          title: req.category === 'skill' ? `Confirm skill: ${req.label}` : `Add to profile: ${req.label}`,
          description: req.category === 'skill'
            ? 'If you have this skill, add it to your skills. If you do not, record it as a confirmed skill gap. Until then, eligibility remains unknown.'
            : 'Update your profile with this information so the eligibility engine can evaluate it.',
          category: req.category,
          priority: 'high',
          due_at: deadline,
        });
      } else {
        items.push({
          title: `Clarify: ${req.label}`,
          description: `This requirement needs manual review: ${audit.explanation}`,
          category: req.category,
          priority: 'medium',
          due_at: deadline,
        });
      }
    } else if (audit.status === 'MISMATCH') {
      if (gap.classification === 'HARD_BLOCKER') {
        items.push({
          title: `Hard blocker: ${req.label}`,
          description: `You do not meet this requirement and it cannot be resolved: ${audit.explanation}`,
          category: req.category,
          priority: 'urgent',
          due_at: null,
        });
      } else {
        items.push({
          title: `Address gap: ${req.label}`,
          description: gap.classificationReason,
          category: req.category,
          priority: days !== null && days <= 7 ? 'urgent' : days !== null && days <= 30 ? 'high' : 'medium',
          due_at: deadline,
        });
      }
    }
  });

  // Add deadline reminder
  if (deadline && days !== null && days > 0) {
    items.push({
      title: `Submit application before deadline`,
      description: `The application deadline is in ${days} day${days === 1 ? '' : 's'}.`,
      category: 'deadline',
      priority: days <= 3 ? 'urgent' : days <= 7 ? 'high' : 'medium',
      due_at: deadline,
    });
  }

  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return items;
}
