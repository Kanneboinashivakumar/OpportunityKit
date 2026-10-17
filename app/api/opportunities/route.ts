import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { createOpportunitySchema } from '@/lib/schemas/opportunity';

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const type = url.searchParams.get('type');
  const requestedLimit = Number(url.searchParams.get('limit') ?? 50);
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, 100)
    : 50;

  let query = supabase
    .from('opportunities')
    .select('id, title, type, status, deadline, created_at, source_url')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);
  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 });

  return NextResponse.json({ opportunities: data ?? [] });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const parsed = createOpportunitySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

  const { raw_text, source_url, title, type } = parsed.data;
  const { data: opportunity, error } = await supabase.from('opportunities').insert({
    owner_id: user.id,
    title: title?.trim() || 'Manually reviewed opportunity',
    type: type ?? 'other',
    source_url: source_url || null,
    raw_text,
    status: 'review',
  }).select().single();
  if (error) return NextResponse.json({ error: 'Could not save opportunity for manual review.' }, { status: 500 });
  return NextResponse.json({ opportunity }, { status: 201 });
}
