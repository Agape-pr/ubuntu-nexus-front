"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useLogout } from "@/lib/api/hooks/useAuth";

/**
 * Top bar used inside the buyer dashboard shell (Overview/Shop/My Orders/Cart/
 * Profile). Deliberately separate from the marketing `Navbar` — no landing-page
 * links (About/How it works/Contact), since this only ever renders for signed-in
 * users already inside the app. Cart lives in the sidebar/bottom tab bar, not here.
 */
export function DashboardNavbar() {
  const logoutMutation = useLogout();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-card/90 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Logo href="/dashboard" />

        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-sm font-medium text-muted-foreground gap-1.5"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
