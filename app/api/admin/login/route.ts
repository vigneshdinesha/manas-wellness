import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, sessionCookieOptions } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ message: 'Server misconfigured' }, { status: 500 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const submitted = body.password ?? '';
  // Constant-time comparison
  if (submitted.length !== expected.length) {
    return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
  }
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= submitted.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) {
    return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set({ ...sessionCookieOptions(), value: token });
  return res;
}
