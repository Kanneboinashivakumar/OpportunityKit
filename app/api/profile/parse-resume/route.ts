import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProvider } from '@/lib/ai/gemini-provider';
import { ProviderNotConfiguredError } from '@/lib/ai/provider';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

const RESUME_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    full_name: { type: 'string', description: 'Candidate full name' },
    email: { type: 'string', description: 'Email address if found' },
    phone: { type: 'string', description: 'Phone number if found' },
    degree: { type: 'string', description: 'Degree program, e.g. B.Tech, M.S.' },
    branch: { type: 'string', description: 'Major or branch, e.g. Computer Science' },
    college: { type: 'string', description: 'University or College name' },
    academic_year: { type: 'string', description: 'Graduation year or current year, e.g. 2026 or 3rd year' },
    cgpa: { type: 'number', description: 'CGPA or GPA numeric value' },
    cgpa_scale: { type: 'number', description: 'CGPA scale, default 10 or 4' },
    skills: {
      type: 'array',
      items: { type: 'string' },
      description: 'Extracted programming languages, frameworks, and technical skills'
    },
    github_url: { type: 'string', description: 'GitHub profile URL' },
    portfolio_url: { type: 'string', description: 'Portfolio or website URL' },
    location: { type: 'string', description: 'City/State/Country' },
  },
  required: ['full_name', 'skills'],
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('resume') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
  }

  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxBytes) {
    return NextResponse.json({ error: 'File exceeds 5MB limit' }, { status: 400 });
  }

  let textContent = '';

  try {
    if (file.type === 'application/pdf') {
      const buffer = Buffer.from(await file.arrayBuffer());
      // Extract text with pdfjs-dist or ASCII extraction
      try {
        // dynamic import of pdfjs-dist
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        let fullText = '';
        for (let i = 1; i <= Math.min(doc.numPages, 5); i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        textContent = fullText;
      } catch (pdfErr) {
        // Fallback: extract readable strings from binary buffer
        textContent = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
      }
    } else {
      // Plain text / Markdown
      textContent = await file.text();
    }
  } catch (parseErr) {
    return NextResponse.json({ error: 'Failed to read resume file content' }, { status: 400 });
  }

  if (textContent.trim().length < 50) {
    return NextResponse.json({
      error: 'Could not extract sufficient text from the resume. Please fill your profile manually.'
    }, { status: 422 });
  }

  // Check if Gemini API is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      error: 'LLM_NOT_CONFIGURED',
      message: 'Gemini API is not configured on the server. Please complete your profile manually.',
      canManuallyEnter: true,
    }, { status: 503 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL ?? 'gemini-3.8-flash';

    const prompt = `Extract structured profile information from this resume text:\n\n${textContent.slice(0, 15000)}`;

    const interaction = await ai.interactions.create({
      model,
      system_instruction: `You are an expert resume parser. Extract candidate details accurately into the requested JSON schema. Do not invent details not present in the resume. Return valid JSON matching the schema.`,
      input: prompt,
      store: false,
      response_format: RESUME_EXTRACTION_SCHEMA as any,
    });

    const rawJson = interaction.output_text ?? '{}';
    const parsed = JSON.parse(rawJson);

    return NextResponse.json({
      success: true,
      extracted: parsed,
      charCount: textContent.length,
    });
  } catch (err: any) {
    return NextResponse.json({
      error: 'PARSING_FAILED',
      message: err.message || 'Failed to extract resume with AI.',
      canManuallyEnter: true,
    }, { status: 500 });
  }
}
