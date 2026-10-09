import { cookies } from 'next/headers';
import { REFRESH_COOKIE, refreshSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const jar = await cookies();
  return refreshSession(req, jar.get(REFRESH_COOKIE)?.value);
}
