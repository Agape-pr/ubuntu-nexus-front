"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, MessageSquare, ShoppingCart, User, Package, LayoutDashboard } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useSellerOrders } from "@/lib/api/hooks/useOrders";
import { useEffect, useState } from "react";

// Timestamp key: stores when the seller last visited the Orders page
const ORDERS_LAST_SEEN_KEY = "orders_last_seen_at";

export const getOrdersLastSeen = (): number => {
  try {
    const raw = localStorage.getItem(ORDERS_LAST_SEEN_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
};

export const markOrdersAsSeen = () => {
  try {
    localStorage.setItem(ORDERS_LAST_SEEN_KEY, Date.now().toString());
  } catch {}
};

const MobileNav = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [lastSeenAt, setLastSeenAt] = useState<number>(0);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setUserRole(localStorage.getItem('user_role'));
    setLastSeenAt(getOrdersLastSeen());
    setMounted(true);
  }, [pathname]); // Re-read on every navigation so badge updates after leaving orders page

  const { data: sellerOrders } = useSellerOrders(mounted && userRole === 'seller');

  // Count orders created AFTER the last time the seller visited the orders page
  const newOrdersCount = sellerOrders?.filter((order: any) => {
    const orderTime = new Date(order.created_at).getTime();
    return orderTime > lastSeenAt && order.status === 'pending';
  }).length || 0;

  if (pathname === "/") {
    return null;
  }

  const navItems = userRole === 'seller' ? [
    { label: "Home", icon: Home, href: "/" },
    { label: "Categories", icon: LayoutGrid, href: "/marketplace" },
    { label: "Messages", icon: MessageSquare, href: "/messages" },
    { label: "Orders", icon: Package, href: "/dashboard/orders", badgeCount: newOrdersCount },
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  ] : [
    { label: "Home", icon: Home, href: "/" },
    { label: "Categories", icon: LayoutGrid, href: "/marketplace" },
    { label: "Messages", icon: MessageSquare, href: "/messages" },
    { label: "Cart", icon: ShoppingCart, href: "/cart", badgeCount: totalItems },
    { label: "Profile", icon: User, href: "/dashboard" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/40 pb-safe z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badgeCount !== undefined && mounted && item.badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border-2 border-card">
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
