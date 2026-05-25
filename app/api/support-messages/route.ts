import { NextRequest, NextResponse } from 'next/server';
import { sql, SupportMessageRow, toPublicDto } from '@/lib/db';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  try {
    const rows = (await sql`
      SELECT id, name, email, message, is_donating, is_approved, created_date
      FROM support_messages
      WHERE is_approved = TRUE
      ORDER BY created_date DESC
    `) as SupportMessageRow[];

    return NextResponse.json(rows.map(toPublicDto));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; message?: string; isDonating?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const errors: Record<string, string[]> = {};
  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const message = (body.message ?? '').trim();
  const isDonating = Boolean(body.isDonating);

  if (!name) errors.name = ['Name is required'];
  else if (name.length > 100) errors.name = ['Name must be 100 characters or less'];

  if (email) {
    if (email.length > 255) errors.email = ['Email must be 255 characters or less'];
    else if (!EMAIL_RE.test(email)) errors.email = ['Email is not a valid address'];
  }

  if (!message) errors.message = ['Message is required'];
  else if (message.length < 10) errors.message = ['Message must be at least 10 characters'];
  else if (message.length > 1000) errors.message = ['Message must be 1000 characters or less'];

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const rows = (await sql`
      INSERT INTO support_messages (name, email, message, is_donating)
      VALUES (${name}, ${email || null}, ${message}, ${isDonating})
      RETURNING id
    `) as Array<{ id: number }>;
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create message' },
      { status: 500 }
    );
  }
}
