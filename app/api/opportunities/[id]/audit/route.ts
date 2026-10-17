import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { auditAllRequirements } from '@/lib/eligibility/engine';
import { generateActionPlan } from '@/lib/eligibility/action-plan';
import type { Requirement } from '@/lib/schemas/requirement';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: opportunity, error: oppErr } = await supabase
    .from('opportunities').select('*').eq('id', id).eq('owner_id', user.id).single();
  if (oppErr || !opportunity) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: requirements, error: requirementsError } = await supabase
    .from('requirements').select('*').eq('opportunity_id', id).eq('owner_id', user.id).order('sort_order');
  if (requirementsError) return NextResponse.json({ error: 'Could not load requirements.' }, { status: 500 });
  const unresolved = (requirements ?? []).filter((requirement) => requirement.needs_review);
  if (unresolved.length > 0) {
    return NextResponse.json({ error: 'Review or confirm every flagged requirement before running the audit.', needsReviewCount: unresolved.length }, { status: 409 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single();
  if (profileError || !profile) return NextResponse.json({ error: 'Profile not found. Complete your profile first.' }, { status: 400 });

  const reqs = (requirements ?? []) as Requirement[];
  const auditOutputs = auditAllRequirements(reqs, profile, id, user.id);

  const { error: deleteAuditError } = await supabase.from('audit_results').delete().eq('opportunity_id', id).eq('owner_id', user.id);
  if (deleteAuditError) return NextResponse.json({ error: 'Could not refresh audit results.' }, { status: 500 });
  if (auditOutputs.length > 0) {
    const { error: saveAuditError } = await supabase.from('audit_results').insert(
      auditOutputs.map((a) => ({
        opportunity_id: a.opportunity_id,
        requirement_id: a.requirement_id,
        owner_id: a.owner_id,
        status: a.status,
        reason_code: a.reason_code,
        explanation: a.explanation,
        evaluated_profile_value: a.evaluated_profile_value ?? null,
        next_action: a.next_action,
        engine_version: a.engine_version,
        evaluated_at: a.evaluated_at,
      }))
    );
    if (saveAuditError) return NextResponse.json({ error: 'Audit ran but results could not be saved.' }, { status: 500 });
  }

  const actionItems = generateActionPlan(reqs, auditOutputs, opportunity.deadline);
  const { error: deleteActionsError } = await supabase.from('action_items').delete().eq('opportunity_id', id).eq('owner_id', user.id);
  if (deleteActionsError) return NextResponse.json({ error: 'Audit saved but action plan could not be refreshed.' }, { status: 500 });
  if (actionItems.length > 0) {
    const { error: saveActionsError } = await supabase.from('action_items').insert(
      actionItems.map((item) => ({
        opportunity_id: id,
        owner_id: user.id,
        title: item.title,
        description: item.description,
        category: item.category,
        priority: item.priority,
        due_at: item.due_at || null,
        status: 'open',
      }))
    );
    if (saveActionsError) return NextResponse.json({ error: 'Audit saved but action plan could not be saved.' }, { status: 500 });
  }

  const { error: statusError } = await supabase.from('opportunities').update({ status: 'audited', updated_at: new Date().toISOString() }).eq('id', id).eq('owner_id', user.id);
  if (statusError) return NextResponse.json({ error: 'Audit saved but opportunity status could not be updated.' }, { status: 500 });

  return NextResponse.json({ auditResults: auditOutputs, actionItems });
}
