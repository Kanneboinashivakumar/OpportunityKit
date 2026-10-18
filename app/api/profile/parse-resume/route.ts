import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

const RESUME_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    full_name: { type: 'string', description: 'Candidate full name' },
    email: { type: 'string', description: 'Email address' },
    phone: { type: 'string', description: 'Phone number' },
    degree: { type: 'string', description: 'Degree program, e.g. B.Tech, B.E., M.Tech, B.Sc' },
    branch: { type: 'string', description: 'Major or branch, e.g. Computer Science, Information Technology, Electronics' },
    college: { type: 'string', description: 'University or College name' },
    academic_year: { type: 'string', description: 'Graduation year (e.g. 2026) or year of study (e.g. 3rd year)' },
    cgpa: { type: 'number', description: 'CGPA or GPA numeric value (e.g. 8.5)' },
    cgpa_scale: { type: 'number', description: 'CGPA scale, default 10' },
    skills: {
      type: 'array',
      items: { type: 'string' },
      description: 'Extracted programming languages, frameworks, libraries, tools, and databases'
    },
    github_url: { type: 'string', description: 'GitHub profile URL' },
    portfolio_url: { type: 'string', description: 'Portfolio, LinkedIn, or personal website URL' },
    location: { type: 'string', description: 'Current city or location' },
  },
  required: ['full_name', 'skills'],
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let textContent = '';
  const formData = await request.formData();
  const clientText = formData.get('text') as string | null;
  const file = formData.get('resume') as File | null;

  if (clientText && clientText.trim().length >= 30) {
    textContent = clientText.trim();
  } else if (file) {
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 });
    }

    try {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // DOCX extraction using mammoth
        const mammoth = await import('mammoth');
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await mammoth.extractRawText({ buffer });
        textContent = result.value || '';
      } else if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
        const buffer = Buffer.from(await file.arrayBuffer());
        try {
          const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
          const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false }).promise;
          let fullText = '';
          for (let i = 1; i <= Math.min(doc.numPages, 5); i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n';
          }
          textContent = fullText;
        } catch {
          // If server-side PDF extraction fails, check if text has readable English words
          const raw = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
          if (!raw.includes('%PDF-') && raw.length > 50) {
            textContent = raw;
          }
        }
      } else {
        textContent = await file.text();
      }
    } catch {
      return NextResponse.json({ error: 'Failed to read resume file content' }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: 'No resume file or text provided' }, { status: 400 });
  }

  // Reject unreadable binary or empty text
  if (textContent.trim().length < 30 || textContent.includes('%PDF-')) {
    return NextResponse.json({
      error: 'Could not extract clean text from this document. If this is a scanned PDF, please paste your resume text or fill the fields manually.'
    }, { status: 422 });
  }

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

    const prompt = `You are an expert resume parser for college students and job applicants.
Carefully extract the candidate's structured profile information from this resume text:

${textContent.slice(0, 20000)}

Guidelines:
1. Full Name: Look at the very top of the resume, contact header, or first 5 lines. Extract the real human name. NEVER output "Unknown" if a candidate name is present.
2. College: Extract the full university or college name (e.g. IIIT Hyderabad, IIT Delhi, Anna University).
3. Degree: Normalize to B.Tech, B.E., B.Sc, BCA, M.Tech, MCA, or relevant degree.
4. Branch: e.g. Computer Science and Engineering, Information Technology, Electronics, Mechanical, etc.
5. Academic Year: Graduation year as a 4-digit year (e.g. 2026, 2025) or year of study.
6. CGPA: Extract only numeric float (e.g. 8.5). Do not confuse percentage with CGPA.
7. Skills: Extract all technical skills, programming languages, tools, frameworks, and databases as an array of strings.
8. Phone & Location: Extract if available.
9. Return valid JSON matching the schema.`;

    const interaction = await ai.interactions.create({
      model,
      system_instruction: `You are an expert resume parser. Extract candidate details accurately into JSON. Do not invent details not present in the text. Cleanly format names, colleges, and skills.`,
      input: prompt,
      store: false,
      response_format: RESUME_EXTRACTION_SCHEMA as any,
    });

    const rawJson = interaction.output_text ?? '{}';
    const parsed = JSON.parse(rawJson);

    // Clean placeholder values
    if (parsed.full_name && ['unknown', 'n/a', 'none', 'null'].includes(parsed.full_name.trim().toLowerCase())) {
      parsed.full_name = '';
    }
    if (parsed.degree && ['unknown', 'n/a', 'none', 'null'].includes(parsed.degree.trim().toLowerCase())) {
      parsed.degree = '';
    }
    if (parsed.college && ['unknown', 'n/a', 'none', 'null'].includes(parsed.college.trim().toLowerCase())) {
      parsed.college = '';
    }
    if (parsed.branch && ['unknown', 'n/a', 'none', 'null'].includes(parsed.branch.trim().toLowerCase())) {
      parsed.branch = '';
    }

    return NextResponse.json({
      success: true,
      extracted: parsed,
      charCount: textContent.length,
    });
  } catch (err: any) {
    console.error('Gemini resume parse error:', err);
    return NextResponse.json({
      error: 'PARSING_FAILED',
      message: err.message || 'Failed to extract resume with AI.',
      canManuallyEnter: true,
    }, { status: 500 });
  }
}
