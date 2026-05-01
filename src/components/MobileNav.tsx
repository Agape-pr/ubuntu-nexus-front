"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, MessageSquare, ShoppingCart, User, Package, LayoutDashboard } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useSellerOrders } from "@/lib/api/hooks/useOrders";
import { useEffect, useState } from "react";

const SEEN_ORDERS_KEY = "seen_order_ids";
const getSeenOrderIds = (): number[] => {
  try { const r = localStorage.getItem(SEEN_ORDERS_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
};

const MobileNav = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState<number[]>([]);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setUserRole(localStorage.getItem('user_role'));
    setSeenIds(getSeenOrderIds());
    setMounted(true);
  }, [pathname]);

  const { data: sellerOrders } = useSellerOrders(mounted && userRole === 'seller');
  
  // Count orders that are 'pending' AND have not been viewed yet (not in seenIds)
  const pendingOrdersCount = sellerOrders?.filter(
    (order: any) => order.status === 'pending' && !seenIds.includes(order.id)
  ).length || 0;

  if (pathname === "/") {
    return null;
  }

  const navItems = userRole === 'seller' ? [
    { label: "Home", icon: Home, href: "/" },
    { label: "Categories", icon: LayoutGrid, href: "/marketplace" },
    { label: "Messages", icon: MessageSquare, href: "/messages" },
    { label: "Orders", icon: Package, href: "/dashboard/orders", badgeCount: pendingOrdersCount },
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
          const isActive = pathname === item.href;
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
