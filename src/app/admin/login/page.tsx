"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAdminSession } from "@/lib/admin/session";
import type { LoginChallenge } from "@/lib/admin/types";
import { buttonClass, ErrorNote, ghostButtonClass, inputClass } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const { startLogin, finishLogin } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try { await fn(); } catch (e) { setError(e); } finally { setBusy(false); }
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => { setChallenge(await startLogin(email.trim(), password)); });
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      try {
        await finishLogin(challenge!.challenge, otp.trim());
      } catch (err) {
        // An expired sign-in can't be retried with the same challenge.
        if (err instanceof Error && /expired|start again/i.test(err.message)) { setChallenge(null); setOtp(""); }
        throw err;
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary"><ShieldCheck size={24} /></div>
          <h1 className="font-display text-2xl font-black text-foreground">UbuntuNow Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {challenge ? `Enter the 6-digit code sent to ${challenge.email_hint}` : "Authorised staff only"}
          </p>
        </div>

        {!challenge ? (
          <form onSubmit={submitPassword} className="space-y-4">
            <label className="block text-sm font-medium">Email
              <input className={`${inputClass} mt-1`} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">Password
              <input className={`${inputClass} mt-1`} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {error ? <ErrorNote error={error} /> : null}
            <button className={`${buttonClass} w-full`} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Continue</button>
          </form>
        ) : (
          <form onSubmit={submitCode} className="space-y-4">
            <input
              className={`${inputClass} text-center font-mono text-xl tracking-[0.5em]`}
              inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required autoFocus
              placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            {error ? <ErrorNote error={error} /> : null}
            <button className={`${buttonClass} w-full`} disabled={busy || otp.length !== 6}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Verify &amp; sign in</button>
            <button type="button" className={`${ghostButtonClass} w-full`} onClick={() => { setChallenge(null); setOtp(""); setError(null); }}>Back</button>
          </form>
        )}
      </div>
    </div>
  );
}
