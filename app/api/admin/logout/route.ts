import { NextResponse } from 'next/server';
import { sessionCookieOptions } from '@/lib/adminAuth';

export async function POST() {
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set({ ...sessionCookieOptions(0), value: '' });
  return res;
}
