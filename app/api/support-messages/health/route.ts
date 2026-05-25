import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const stats = await sql`
      SELECT
        COUNT(*)::int                                       AS total,
        COUNT(*) FILTER (WHERE is_approved)::int            AS approved,
        COUNT(*) FILTER (WHERE NOT is_approved)::int        AS pending
      FROM support_messages
    ` as Array<{ total: number; approved: number; pending: number }>;

    const { total, approved, pending } = stats[0];

    return NextResponse.json({
      status: 'Healthy',
      database: 'Neon Postgres',
      connectionString: 'redacted',
      tableExists: true,
      statistics: {
        totalMessages: total,
        approvedMessages: approved,
        pendingMessages: pending,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'Unhealthy',
        database: 'Neon Postgres',
        tableExists: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
