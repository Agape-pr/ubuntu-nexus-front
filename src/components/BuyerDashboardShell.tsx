"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Store, ShoppingBag, ShoppingCart, LayoutDashboard, User, ChevronRight } from "lucide-react";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { useCurrentUser } from "@/lib/api/hooks/useUsers";
import { useCartStore } from "@/lib/store/cartStore";

type IconType = React.ComponentType<{ size?: number | string; className?: string; strokeWidth?: number | string }>;

// Order matches the product spec: Shop, My Orders, Cart, Overview, Profile.
const NAV_ITEMS: {
  href: string;
  label: string;
  icon: IconType;
  isActive: (pathname: string, isShop: boolean) => boolean;
}[] = [
  { href: "/dashboard?view=shop", label: "Shop", icon: Store, isActive: (p, isShop) => p === "/dashboard" && isShop },
  { href: "/my-orders", label: "My Orders", icon: ShoppingBag, isActive: (p) => p.startsWith("/my-orders") },
  { href: "/cart", label: "Cart", icon: ShoppingCart, isActive: (p) => p.startsWith("/cart") },
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, isActive: (p, isShop) => p === "/dashboard" && !isShop },
  { href: "/profile", label: "Profile", icon: User, isActive: (p) => p.startsWith("/profile") },
];

interface BuyerDashboardShellProps {
  children: React.ReactNode;
  /**
   * Suppresses the mobile bottom tab bar (desktop sidebar is unaffected).
   * Used by the product detail page, which handles its own back/cart controls
   * as overlays on the image for a distraction-free, full-bleed mobile view.
   */
  hideMobileBottomNav?: boolean;
}

/**
 * The single navigation shell shared by every buyer-facing app page —
 * Shop, My Orders, Cart, Overview, Profile — desktop sidebar / mobile bottom
 * tab bar + top bar, so the chrome never disappears or duplicates itself
 * when navigating between them.
 */
export function BuyerDashboardShell({ children, hideMobileBottomNav }: BuyerDashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isShop = searchParams.get("view") === "shop" || !!searchParams.get("search");

  const { data: userProfile } = useCurrentUser();
  const cartCount = useCartStore((s) => s.getTotalItems());
  const firstName = userProfile?.first_name || "there";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar is desktop-only — the bottom tab bar covers mobile navigation */}
      <div className="hidden lg:block sticky top-0 z-50 w-full">
        <DashboardNavbar />
      </div>

      <div className="flex flex-1">
        {/* -- Sidebar -- */}
        <aside className="hidden lg:flex w-64 xl:w-72 flex-col bg-card border-r border-border sticky top-14 h-[calc(100vh-56px)]">
          <div className="p-5 border-b border-border/80">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                <span className="text-foreground font-bold text-sm">
                  {(userProfile?.first_name?.[0] || "U").toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-sm truncate">{firstName}</div>
                <div className="text-xs text-muted-foreground">Buyer account</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = item.isActive(pathname, isShop);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <item.icon size={16} className={isActive ? "text-primary-foreground" : ""} />
                  {item.label}
                  {item.href === "/cart" && cartCount > 0 && (
                    <span className="ml-auto h-5 min-w-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center px-1.5">
                      {cartCount}
                    </span>
                  )}
                  {isActive && item.href !== "/cart" && <ChevronRight size={14} className="ml-auto opacity-70" />}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* -- Main content -- */}
        <main
          className={`flex-1 overflow-y-auto bg-background lg:pb-0 ${
            hideMobileBottomNav ? "" : "pb-[calc(3.5rem+env(safe-area-inset-bottom))]"
          }`}
        >
          {children}
        </main>
      </div>

      {/* -- Mobile bottom tab bar -- */}
      {!hideMobileBottomNav && (
        <nav
          aria-label="Dashboard"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border/40 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center justify-around h-14">
            {NAV_ITEMS.map((item) => {
              const isActive = item.isActive(pathname, isShop);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    {item.href === "/cart" && cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border-2 border-card">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
