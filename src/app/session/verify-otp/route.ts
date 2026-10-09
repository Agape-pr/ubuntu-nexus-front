import { signIn } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return signIn(req, '/auth/otp/verify/', ['email', 'purpose', 'otp']);
}
