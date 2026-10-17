import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { createOpportunitySchema } from '@/lib/schemas/opportunity';
import { getProvider } from '@/lib/ai/gemini-provider';
import { ProviderNotConfiguredError, ExtractionError } from '@/lib/ai/provider';

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED', message: 'Configure Supabase before using OpportunityKit.' }, { status: 503 });
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

  const parsed = createOpportunitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const { raw_text, source_url, title, type } = parsed.data;

  const MAX_CHARS = Number(process.env.MAX_ANNOUNCEMENT_CHARS ?? 30000);
  if (raw_text.length > MAX_CHARS) {
    return NextResponse.json({ error: `Text exceeds ${MAX_CHARS} characters` }, { status: 400 });
  }

  const configuredLimit = Number(process.env.EXTRACTION_RATE_LIMIT_PER_HOUR ?? 20);
  const rateLimit = Number.isInteger(configuredLimit) && configuredLimit > 0
    ? Math.min(configuredLimit, 1000)
    : 20;
  const { data: withinLimit, error: rateLimitError } = await supabase.rpc(
    'consume_extraction_rate_limit',
    { p_limit: rateLimit }
  );
  if (rateLimitError) {
    console.error('Extraction rate limiter unavailable:', rateLimitError.code);
    return NextResponse.json({ error: 'RATE_LIMIT_UNAVAILABLE', message: 'Extraction is temporarily unavailable. Please try again later.' }, { status: 503 });
  }
  if (!withinLimit) {
    return NextResponse.json({ error: 'RATE_LIMITED', message: 'You have reached the hourly extraction limit. Please try again later.' }, { status: 429 });
  }

  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) {
      return NextResponse.json({
        error: 'LLM_NOT_CONFIGURED',
        message: 'The Gemini API key is not configured. Add GEMINI_API_KEY to your environment variables.',
        canManuallyEnter: true,
      }, { status: 503 });
    }
    throw err;
  }

  let extracted;
  try {
    extracted = await provider.extractRequirements(raw_text);
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) {
      return NextResponse.json({
        error: 'LLM_NOT_CONFIGURED',
        message: 'Gemini API key invalid or missing.',
        canManuallyEnter: true,
      }, { status: 503 });
    }
    if (err instanceof ExtractionError) {
      console.error('Extraction provider returned an error:', err.name);
      return NextResponse.json({ error: 'EXTRACTION_FAILED', message: 'The provider could not extract requirements from this announcement. Review it manually or try again.' }, { status: 422 });
    }
    console.error('Unexpected extraction failure:', err instanceof Error ? err.name : 'unknown');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  const { data: opportunity, error: oppError } = await supabase
    .from('opportunities')
    .insert({
      owner_id: user.id,
      title: title?.trim() || extracted.title,
      type: type ?? extracted.type,
      source_url: source_url || null,
      raw_text,
      deadline: extracted.deadline || null,
      extraction_provider: provider.name,
      extraction_model: provider.model,
      extracted_at: new Date().toISOString(),
      status: 'review',
    })
    .select()
    .single();

  if (oppError) {
    return NextResponse.json({ error: 'Failed to save opportunity' }, { status: 500 });
  }

  const requirementsToInsert = extracted.requirements.map((req, idx) => ({
    opportunity_id: opportunity.id,
    owner_id: user.id,
    category: req.category,
    label: req.label,
    operator: req.operator,
    expected_value: req.expectedValue ?? null,
    required: req.required,
    source_text: req.sourceText ?? null,
    confidence: req.confidence ?? null,
    needs_review: req.needsReview,
    notes: req.notes ?? null,
    sort_order: idx,
  }));

  if (requirementsToInsert.length > 0) {
    const { error: requirementsError } = await supabase.from('requirements').insert(requirementsToInsert);
    if (requirementsError) {
      await supabase.from('opportunities').delete().eq('id', opportunity.id).eq('owner_id', user.id);
      return NextResponse.json({ error: 'Failed to save extracted requirements. Please retry.' }, { status: 500 });
    }
  }

  return NextResponse.json({ opportunity, extracted, requirementCount: requirementsToInsert.length });
}
