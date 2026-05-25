import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { isAdmin } from '@/lib/adminAuth';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  try {
    const rows = (await sql`
      DELETE FROM support_messages
      WHERE id = ${numericId}
      RETURNING id
    `) as Array<{ id: number }>;

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete message' },
      { status: 500 }
    );
  }
}
