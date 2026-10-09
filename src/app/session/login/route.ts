import { signIn } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return signIn(req, '/users/login', ['username', 'password']);
}
