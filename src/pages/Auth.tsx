import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Store, ShoppingBag } from "lucide-react";

type Role = "buyer" | "seller";
type Tab = "login" | "register";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = (searchParams.get("tab") as Tab) || "login";
  const defaultRole = (searchParams.get("role") as Role) || "buyer";

  const [tab, setTab] = useState<Tab>(defaultTab);
  const [role, setRole] = useState<Role>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic will connect to backend
    console.log("Form submitted:", { tab, role, form });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex w-1/2 gradient-hero relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald/10 blur-3xl" />

        <Link to="/" className="flex items-center gap-2.5 z-10 relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold">
            UN
          </div>
          <span className="font-bold text-xl text-primary-foreground">
            Ubuntu<span className="text-accent">Now</span>
          </span>
        </Link>

        <div className="relative z-10">
          <blockquote className="text-3xl font-bold text-primary-foreground leading-snug mb-6">
            "I am because we are."
          </blockquote>
          <p className="text-primary-foreground/60 text-lg">
            Join a community of entrepreneurs and shoppers building the future of African commerce together.
          </p>
          <div className="mt-10 flex gap-4">
            {["🛍️ 18,000+ products", "🏪 2,400+ sellers", "🇷🇼 Made in Kigali"].map((item) => (
              <div key={item} className="px-3 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-xs font-medium border border-primary-foreground/20">
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-foreground/30 text-xs relative z-10">© 2025 UbuntuNow Ltd, Kigali</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={15} />
            Back to home
          </Link>

          {/* Tabs */}
          <div className="flex bg-secondary rounded-xl p-1 mb-8 w-fit">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  tab === t
                    ? "bg-card shadow-card text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {tab === "login" ? "Welcome back" : "Join UbuntuNow"}
            </h1>
            <p className="text-muted-foreground">
              {tab === "login"
                ? "Sign in to access your store and orders."
                : "Create your account and start in minutes."}
            </p>
          </div>

          {/* Role selector (register only) */}
          {tab === "register" && (
            <div className="mb-6">
              <Label className="text-sm font-medium text-foreground mb-3 block">I want to</Label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "buyer", label: "Shop & buy", icon: ShoppingBag, desc: "Browse and purchase from local sellers" },
                    { value: "seller", label: "Sell products", icon: Store, desc: "Create my store and reach customers" },
                  ] as { value: Role; label: string; icon: typeof Store; desc: string }[]
                ).map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() => setRole(value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      role === value
                        ? "border-primary bg-secondary"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    <Icon size={20} className={role === value ? "text-primary mb-2" : "text-muted-foreground mb-2"} />
                    <div className="font-semibold text-sm text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Amina Uwase"
                  className="mt-1.5 h-11 rounded-xl"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="amina@example.com"
                className="mt-1.5 h-11 rounded-xl"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {tab === "register" && (
              <div>
                <Label htmlFor="phone">Phone number (optional)</Label>
                <Input
                  id="phone"
                  placeholder="+250 7XX XXX XXX"
                  className="mt-1.5 h-11 rounded-xl"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {tab === "login" && (
                  <button type="button" className="text-xs text-accent hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pr-11"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 rounded-xl text-base font-semibold mt-2"
            >
              {tab === "login" ? "Sign in" : `Create ${role} account`}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setTab(tab === "login" ? "register" : "login")}
              className="text-accent font-medium hover:underline"
            >
              {tab === "login" ? "Create one" : "Sign in"}
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By continuing, you agree to UbuntuNow's{" "}
            <a href="#" className="underline">Terms</a> &{" "}
            <a href="#" className="underline">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
