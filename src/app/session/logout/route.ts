import { crossSite, endSession, json } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (crossSite(req)) return json({ detail: 'Forbidden' }, 403);
  const res = json({ ok: true });
  endSession(res);
  return res;
}
