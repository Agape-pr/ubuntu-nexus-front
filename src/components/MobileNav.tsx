"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Package, LayoutDashboard } from "lucide-react";
import { useSellerOrders } from "@/lib/api/hooks/useOrders";
import { useEffect, useState } from "react";

// Store the highest order ID the seller has already seen on the Orders page
const LAST_SEEN_ORDER_ID_KEY = "last_seen_order_id";

export const getLastSeenOrderId = (): number => {
  try { return parseInt(localStorage.getItem(LAST_SEEN_ORDER_ID_KEY) || "0", 10); }
  catch { return 0; }
};

export const markOrdersAsSeen = (orders: any[]) => {
  if (!orders.length) return;
  const maxId = Math.max(...orders.map((o) => o.id));
  try { localStorage.setItem(LAST_SEEN_ORDER_ID_KEY, String(maxId)); }
  catch {}
};

const MobileNav = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastSeenId, setLastSeenId] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      setUserRole(localStorage.getItem("user_role"));
      setIsLoggedIn(!!localStorage.getItem("access_token"));
      setLastSeenId(getLastSeenOrderId());
    };
    checkAuth();
    setMounted(true);
    window.addEventListener("auth-change", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("auth-change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname]);

  const isSeller = mounted && userRole === "seller";
  const { data: sellerOrders } = useSellerOrders(isSeller);

  // Badge = orders with an ID higher than what seller last saw, that are still new
  const badgeCount =
    sellerOrders?.filter(
      (o: any) => o.id > lastSeenId && (o.status === "pending" || o.status === "confirmed")
    ).length ?? 0;

  // Buyers get their navigation entirely from BuyerDashboardShell (Shop, My Orders,
  // Cart, Overview, Profile — the single unified buyer nav). This bar now only
  // serves signed-in sellers browsing outside their dashboard — /dashboard already
  // has its own complete mobile tab bar, so a second one here would duplicate it.
  if (!mounted || !isLoggedIn || !isSeller) return null;
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/product")) return null;

  const navItems = [
    { label: "Home",      icon: Home,           href: "/" },
    { label: "Categories",icon: LayoutGrid,     href: "/#categories" },
    { label: "Orders",    icon: Package,        href: "/dashboard", badgeCount },
    { label: "Dashboard", icon: LayoutDashboard,href: "/dashboard" },
  ];

  return (
    <>
      {/* Reserves scroll space for the fixed bar below — only present when the bar is */}
      <div aria-hidden className="md:hidden h-[calc(3.5rem+env(safe-area-inset-bottom))]" />

      <nav
        aria-label="Primary"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/40 pb-[env(safe-area-inset-bottom)] z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
      >
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const basePath = item.href.split("#")[0];
            const isActive =
              basePath !== "" &&
              !item.href.includes("#") &&
              (pathname === basePath || pathname.startsWith(basePath + "/"));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badgeCount !== undefined &&
                    mounted &&
                    item.badgeCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border-2 border-card">
                        {item.badgeCount}
                      </span>
                    )}
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
