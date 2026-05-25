import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

export type SupportMessageRow = {
  id: number;
  name: string;
  email: string | null;
  message: string;
  is_donating: boolean;
  is_approved: boolean;
  created_date: string;
};

export function toPublicDto(row: SupportMessageRow) {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    isDonating: row.is_donating,
    createdDate: row.created_date,
  };
}

export function toAdminDto(row: SupportMessageRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    message: row.message,
    isDonating: row.is_donating,
    isApproved: row.is_approved,
    createdDate: row.created_date,
  };
}
