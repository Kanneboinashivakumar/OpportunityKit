import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: opportunity, error } = await supabase
    .from('opportunities').select('*').eq('id', id).eq('owner_id', user.id).single();
  if (error || !opportunity) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: requirements } = await supabase
    .from('requirements').select('*').eq('opportunity_id', id).eq('owner_id', user.id).order('sort_order');
  const { data: auditResults } = await supabase
    .from('audit_results').select('*').eq('opportunity_id', id).eq('owner_id', user.id);
  const { data: actionItems } = await supabase
    .from('action_items').select('*').eq('opportunity_id', id).eq('owner_id', user.id).order('created_at');

  return NextResponse.json({ opportunity, requirements: requirements ?? [], auditResults: auditResults ?? [], actionItems: actionItems ?? [] });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase.from('opportunities').delete().eq('id', id).eq('owner_id', user.id);
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  return NextResponse.json({ success: true });
}
