import { NextResponse } from 'next/server';
import { sql, SupportMessageRow, toAdminDto } from '@/lib/db';
import { isAdmin } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const rows = (await sql`
      SELECT id, name, email, message, is_donating, is_approved, created_date
      FROM support_messages
      ORDER BY created_date DESC
    `) as SupportMessageRow[];

    return NextResponse.json(rows.map(toAdminDto));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
