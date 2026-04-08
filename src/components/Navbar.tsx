"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/api/hooks/useAuth";
import { useCartStore } from "@/lib/store/cartStore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const logoutMutation = useLogout();
  
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
      setUserRole(localStorage.getItem('user_role'));
    };
    checkAuth();
    setMounted(true);
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [pathname]);

  const navLinks = [
    { label: "Marketplace", to: "/marketplace" },
    // Only show Sell link if user is explicitly a seller
    ...(userRole === 'seller' ? [{ label: "Sell", to: "/dashboard" }] : []),
    { label: "How it works", to: "/#how-it-works" },
  ];

  const isActive = (to: string) => pathname === to;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="font-bold text-lg text-foreground tracking-tight">
            Ubuntu<span className="text-accent">Now</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to)
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
            <Search size={18} />
          </button>
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
            <Bell size={18} />
          </button>
          <Link href="/cart">
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 relative">
              <ShoppingBag size={18} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-accent flex items-center justify-center px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-card">
                  {totalItems}
                </span>
              )}
            </button>
          </Link>
          <div className="w-px h-5 bg-border mx-1" />
          {isLoggedIn ? (
            <>
              {userRole === 'seller' && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-sm font-medium gap-1.5">
                    <User size={16} /> Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" className="text-sm font-medium gap-1.5 text-muted-foreground" onClick={() => logoutMutation.mutate()}>
                <LogOut size={16} /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-sm font-medium">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button size="sm" className="text-sm font-medium rounded-xl">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-up">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  {userRole === 'seller' && (
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-1.5"><User size={16} /> Dashboard</Button>
                    </Link>
                  )}
                  <Button className="w-full gap-1.5" variant="ghost" onClick={() => { setIsOpen(false); logoutMutation.mutate(); }}>
                    <LogOut size={16} /> Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Sign in</Button>
                  </Link>
                  <Link href="/auth?tab=register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Get started free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
