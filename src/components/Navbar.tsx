"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingBag, Search, User, LogOut, Shield, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/api/hooks/useAuth";
import { useCartStore } from "@/lib/store/cartStore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();

  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("access_token"));
      setUserRole(localStorage.getItem("user_role"));
    };
    checkAuth();
    setMounted(true);
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const isActive = (to: string) => pathname === to;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/90 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <span className="text-primary-foreground font-black text-xs">UN</span>
          </div>
          <span className="font-bold text-[15px] text-foreground tracking-tight">
            Ubuntu<span className="text-accent">Now</span>
          </span>
        </Link>

        {/* ── Desktop Centre Nav ── */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-6">
          <Link
            href="/home"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive("/home")
                ? "text-foreground bg-secondary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
            }`}
          >
            Learn how it works
          </Link>

          <Link
            href={userRole === "seller" ? "/dashboard" : "/auth?tab=register&intent=seller"}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive("/dashboard") && userRole === "seller"
                ? "text-foreground bg-secondary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
            }`}
          >
            <Store size={14} />
            {userRole === "seller" ? "My Store" : "Start your store"}
          </Link>

          {userRole === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-violet-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-200"
            >
              <Shield size={14} />
              Admin
            </Link>
          )}
        </nav>

        {/* ── Desktop Right Actions ── */}
        <div className="hidden md:flex items-center gap-1">
          {/* Search */}
          <button
            aria-label="Search"
            onClick={openSearch}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
          >
            <Search size={17} />
          </button>

          {/* Cart — buyers only */}
          {userRole !== "seller" && (
            <Link href="/cart">
              <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
                <ShoppingBag size={17} />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-accent flex items-center justify-center px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-card">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>
          )}

          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Auth zone */}
          {isLoggedIn ? (
            <div className="flex items-center gap-1">
              {userRole === "seller" && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="h-9 px-3 text-sm font-medium gap-1.5">
                    <User size={14} /> Dashboard
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-sm font-medium text-muted-foreground gap-1.5"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut size={14} /> Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="h-9 px-3 text-sm font-medium">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button size="sm" className="h-9 px-4 text-sm font-semibold rounded-xl shadow-sm">
                  Get started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Right Icons ── */}
        <div className="md:hidden flex items-center gap-1">
          <button
            aria-label="Search"
            onClick={openSearch}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <Search size={18} />
          </button>

          {/* User avatar / sign-in icon */}
          <Link href={isLoggedIn ? (userRole === "seller" ? "/dashboard" : "/auth") : "/auth"}>
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
              <User size={15} className="text-primary" />
            </div>
          </Link>

          {/* Hamburger */}
          <button
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-up">
          <div className="container py-4 flex flex-col gap-1">
            <Link
              href="/home"
              onClick={() => setIsOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive("/home")
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              💡 Learn how it works
            </Link>

            <Link
              href={userRole === "seller" ? "/dashboard" : "/auth?tab=register&intent=seller"}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <Store size={15} />
              {userRole === "seller" ? "My Store / Dashboard" : "Start your store"}
            </Link>

            {userRole !== "seller" && (
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag size={15} /> Cart
                </span>
                {mounted && totalItems > 0 && (
                  <span className="h-5 min-w-5 rounded-full bg-accent flex items-center justify-center px-1 text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            <div className="mt-2 pt-3 border-t border-border flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  {userRole === "admin" && (
                    <Link href="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-1.5 border-violet-200 text-violet-500">
                        <Shield size={16} /> Admin Panel
                      </Button>
                    </Link>
                  )}
                  {userRole === "seller" && (
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-1.5">
                        <User size={16} /> Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button
                    className="w-full gap-1.5"
                    variant="ghost"
                    onClick={() => { setIsOpen(false); logoutMutation.mutate(); }}
                  >
                    <LogOut size={16} /> Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Sign in</Button>
                  </Link>
                  <Link href="/auth?tab=register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full font-semibold">Get started free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={handleSearchSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-lift overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or stores…"
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            {searchQuery.trim() && (
              <div className="border-t border-border px-4 py-3">
                <button type="submit" className="text-sm text-accent font-medium hover:underline">
                  Search for &ldquo;{searchQuery}&rdquo; in Marketplace →
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </header>
  );
};

export default Navbar;
