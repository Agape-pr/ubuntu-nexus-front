"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User, Package, LayoutDashboard, ClipboardList } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
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
  const [lastSeenId, setLastSeenId] = useState(0);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const checkAuth = () => {
      setUserRole(localStorage.getItem("user_role"));
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

  if (pathname.startsWith("/auth")) return null;

  // ── Seller nav: Home · Categories · Orders · Dashboard ──────────────
  // ── Buyer nav:  Home · Categories · My Orders · Cart · Profile ──────
  const navItems = isSeller
    ? [
        { label: "Home",      icon: Home,           href: "/" },
        { label: "Categories",icon: LayoutGrid,     href: "/" },
        { label: "Orders",    icon: Package,        href: "/dashboard", badgeCount },
        { label: "Dashboard", icon: LayoutDashboard,href: "/dashboard" },
      ]
    : [
        { label: "Home",      icon: Home,           href: "/" },
        { label: "Categories",icon: LayoutGrid,     href: "/" },
        { label: "My Orders", icon: ClipboardList,  href: "/my-orders" },
        { label: "Cart",      icon: ShoppingCart,   href: "/cart", badgeCount: totalItems },
        { label: "Profile",   icon: User,           href: "/profile" },
      ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/40 pb-safe z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badgeCount !== undefined &&
                  mounted &&
                  item.badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border-2 border-card animate-pulse">
                      {item.badgeCount}
                    </span>
                  )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
