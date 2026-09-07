"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether a buyer/seller is signed in, mirroring the check Navbar/MobileNav
 * already use. `mounted` stays false during SSR/hydration so callers can avoid
 * flashing gated content before localStorage is readable.
 */
export function useAuthState() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("access_token"));
      setUserRole(localStorage.getItem("user_role"));
    };
    checkAuth();
    setMounted(true);
    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-change", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  return { isLoggedIn: mounted && isLoggedIn, userRole: mounted ? userRole : null, mounted };
}
