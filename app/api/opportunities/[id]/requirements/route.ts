import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { requirementUpdateSchema } from '@/lib/schemas/requirement';

const manualRequirementSchema = requirementUpdateSchema.extend({
  category: requirementUpdateSchema.shape.category.unwrap(),
  label: requirementUpdateSchema.shape.label.unwrap(),
  operator: requirementUpdateSchema.shape.operator.unwrap(),
  expected_value: requirementUpdateSchema.shape.expected_value,
});
const requirementUpdateRequestSchema = z.object({
  requirementId: z.string().uuid(),
  update: requirementUpdateSchema,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = manualRequirementSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

  const { data: opportunity } = await supabase.from('opportunities').select('id').eq('id', id).eq('owner_id', user.id).single();
  if (!opportunity) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data: lastRequirement, error: orderError } = await supabase.from('requirements')
    .select('sort_order').eq('opportunity_id', id).eq('owner_id', user.id)
    .order('sort_order', { ascending: false }).limit(1).maybeSingle();
  if (orderError) return NextResponse.json({ error: 'Could not load requirement order.' }, { status: 500 });
  const { data, error } = await supabase.from('requirements').insert({
    opportunity_id: id,
    owner_id: user.id,
    category: parsed.data.category,
    label: parsed.data.label,
    operator: parsed.data.operator,
    expected_value: parsed.data.expected_value ?? null,
    required: parsed.data.required ?? true,
    source_text: null,
    confidence: null,
    needs_review: false,
    notes: parsed.data.notes ?? 'Manually added by the user.',
    sort_order: (lastRequirement?.sort_order ?? -1) + 1,
  }).select().single();
  if (error) return NextResponse.json({ error: 'Could not add requirement.' }, { status: 500 });
  return NextResponse.json({ requirement: data }, { status: 201 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsedRequest = requirementUpdateRequestSchema.safeParse(body);
  if (!parsedRequest.success) return NextResponse.json({ error: 'Validation failed', details: parsedRequest.error.flatten() }, { status: 400 });
  const { requirementId, update } = parsedRequest.data;

  const { data: req } = await supabase
    .from('requirements').select('id').eq('id', requirementId).eq('opportunity_id', id).eq('owner_id', user.id).single();
  if (!req) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await supabase.from('requirements').update(update).eq('id', requirementId).select().single();
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  return NextResponse.json({ requirement: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const requirementId = url.searchParams.get('requirementId');
  if (!requirementId) return NextResponse.json({ error: 'requirementId required' }, { status: 400 });

  const { error } = await supabase.from('requirements').delete().eq('id', requirementId).eq('opportunity_id', id).eq('owner_id', user.id);
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  return NextResponse.json({ success: true });
}
