"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { adminApi, clearSession, hasStoredSession, SESSION_EXPIRED_EVENT } from './api';
import type { AdminPermission, AdminSessionUser, LoginChallenge } from './types';

const IDLE_LIMIT_MS = 30 * 60 * 1000;   // sign out after 30 minutes without activity
const RECHECK_MS = 5 * 60 * 1000;       // re-read permissions so changes show up

interface SessionValue {
  status: 'loading' | 'anonymous' | 'authenticated';
  user: AdminSessionUser | null;
  can: (permission: AdminPermission) => boolean;
  startLogin: (email: string, password: string) => Promise<LoginChallenge>;
  finishLogin: (challenge: string, otp: string) => Promise<void>;
  logout: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionValue['status']>('loading');
  const [user, setUser] = useState<AdminSessionUser | null>(null);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const adopt = useCallback((u: AdminSessionUser) => {
    if (u.role !== 'admin') { logout(); return; }
    setUser(u);
    setStatus('authenticated');
  }, [logout]);

  // Restore the session on page load.
  useEffect(() => {
    if (!hasStoredSession()) { setStatus('anonymous'); return; }
    adminApi.me().then(adopt).catch(logout);
  }, [adopt, logout]);

  // Expired / revoked session anywhere in the app.
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

  // Idle timeout + periodic permission re-check while signed in.
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (status !== 'authenticated') return;
    const reset = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(logout, IDLE_LIMIT_MS);
    };
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    const recheck = setInterval(() => { adminApi.me().then(adopt).catch(() => {}); }, RECHECK_MS);
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(idleTimer.current);
      clearInterval(recheck);
    };
  }, [status, logout, adopt]);

  const value = useMemo<SessionValue>(() => ({
    status,
    user,
    can: (permission) => !!user && (user.is_superuser || user.admin_permissions.includes(permission)),
    startLogin: (email, password) => adminApi.login(email, password),
    finishLogin: async (challenge, otp) => { adopt(await adminApi.verify(challenge, otp)); },
    logout,
  }), [status, user, adopt, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAdminSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useAdminSession must be used inside AdminSessionProvider');
  return ctx;
}
