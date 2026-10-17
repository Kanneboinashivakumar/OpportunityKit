import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { scrapeWebpageContent, ScraperError } from '@/lib/url-scraper';

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'SUPABASE_NOT_CONFIGURED', message: 'Configure Supabase before using OpportunityKit.' },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON', message: 'Invalid JSON body' }, { status: 400 });
  }

  const { url } = body;
  if (!url || typeof url !== 'string' || !url.trim()) {
    return NextResponse.json({ error: 'MISSING_URL', message: 'Please provide a valid URL to analyze.' }, { status: 400 });
  }

  try {
    const scraped = await scrapeWebpageContent(url.trim());
    return NextResponse.json({
      success: true,
      title: scraped.title,
      text: scraped.text,
      url: scraped.url,
      charCount: scraped.text.length,
    });
  } catch (err: unknown) {
    if (err instanceof ScraperError) {
      return NextResponse.json(
        {
          error: err.code,
          message: err.message,
          suggestion: 'You can copy and paste the announcement text directly or upload a document.',
        },
        { status: 422 }
      );
    }

    const message = err instanceof Error ? err.message : 'Failed to fetch webpage content.';
    return NextResponse.json(
      {
        error: 'FETCH_FAILED',
        message,
        suggestion: 'Please paste the announcement text manually.',
      },
      { status: 500 }
    );
  }
}
