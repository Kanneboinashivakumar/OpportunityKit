import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { profileUpdateSchema } from '@/lib/schemas/profile';

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ profile: data ?? null });
}

export async function PUT(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  // Known standard columns from 001 and 002 schema
  const knownCols = new Set([
    'full_name', 'degree', 'branch', 'academic_year', 'cgpa', 'cgpa_scale',
    'marks_percentage', 'annual_income', 'skills', 'skill_gaps', 'documents',
    'location', 'work_authorization', 'team_size', 'github_url', 'portfolio_url',
    'availability_weeks', 'preferences'
  ]);

  const rawData = { ...parsed.data };
  const preferences: Record<string, unknown> = {
    ...(typeof rawData.preferences === 'object' && rawData.preferences !== null ? rawData.preferences : {}),
  };

  const payload: Record<string, unknown> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  for (const [key, val] of Object.entries(rawData)) {
    if (knownCols.has(key)) {
      payload[key] = val;
    } else {
      preferences[key] = val;
    }
  }
  payload.preferences = preferences;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to save profile. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
