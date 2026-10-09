"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, ArrowLeft, Store, ShoppingBag, Mail, Timer, Lock, Truck, MapPin } from "lucide-react";
import { useLogin, useRegister, useVerifyOTP, useResendOTP } from "@/lib/api/hooks/useAuth";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import conventionImage from "@/assets/kigali-convention.jpeg";

// ── OTP_EXPIRY and RESEND_COOLDOWN match auth-service/apps/authentication/services/otp_service.py
const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60;

/** 6-box OTP input with auto-advance, backspace, and paste support */
const OtpBoxes = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = value.split("");
      if (next[idx]) {
        next[idx] = "";
        onChange(next.join(""));
      } else if (idx > 0) {
        next[idx - 1] = "";
        onChange(next.join(""));
        inputRefs.current[idx - 1]?.focus();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const next = value.split("").slice(0, 6);
    next[idx] = digit;
    const joined = next.join("").slice(0, 6);
    onChange(joined);
    if (idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const nextIdx = Math.min(pasted.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((idx) => (
        <input
          key={idx}
          ref={(el) => { inputRefs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={idx === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${idx + 1} of 6`}
          maxLength={1}
          value={value[idx] ?? ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKey(e, idx)}
          autoFocus={idx === 0}
          className={`min-w-0 flex-1 max-w-[3.25rem] h-14 text-center text-xl font-bold rounded-xl border-2 bg-card text-foreground outline-none transition-all duration-150
            ${value[idx] ? "border-primary shadow-sm" : "border-border"}
            focus:border-primary focus:ring-2 focus:ring-primary/20
            caret-transparent`}
        />
      ))}
    </div>
  );
};

type Role = "buyer" | "seller";
type Tab = "login" | "register";
type RegistrationStep = "form" | "otp";

/**
 * Registration Flow (matches backend API):
 * 1. User fills form → POST /api/v1/users/register (creates inactive user)
 * 2. On success → POST /api/v1/auth/otp/email/send/ (sends OTP)
 * 3. User enters OTP → POST /api/v1/auth/otp/verify/ (activates user, returns tokens)
 * 4. Tokens stored → Navigate to dashboard/marketplace
 *
 * Backend requires: Register FIRST (user must exist), then Send OTP, then Verify
 */

const AuthContent = () => {
  const searchParams = useSearchParams();
  const defaultTab = (searchParams.get("tab") as Tab) || "login";
  const defaultRole = (searchParams.get("role") as Role) || "buyer";

  const [tab, setTab] = useState<Tab>(defaultTab);
  const [role, setRole] = useState<Role>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>("form");
  const [form, setForm] = useState<{
    name: string; email: string; password: string; phone: string; store_description: string;
  }>({ name: "", email: "", password: "", phone: "", store_description: "" });
  const [otp, setOtp] = useState("");
  const [registrationData, setRegistrationData] = useState<{
    email: string;
    password: string;
    account_type: Role;
    phone_number?: string;
    store?: { store_name: string; store_description?: string };
  } | null>(null);

  // Countdown timers — mirror backend constants
  const [expiryCountdown, setExpiryCountdown] = useState(OTP_EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (registrationStep !== "otp") return;
    setExpiryCountdown(OTP_EXPIRY_SECONDS);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);

    const tick = setInterval(() => {
      setExpiryCountdown((s) => Math.max(0, s - 1));
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [registrationStep]);

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      username: form.email,
      password: form.password,
    });
  };

  const handleRegisterFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sellers require store with store_name
    if (role === 'seller' && !form.name?.trim()) {
      toast.error('Store name is required for sellers');
      return;
    }

    // Convert file to base64 handler is inline in the JSX
    // Prepare registration data - backend: sellers MUST have store, buyers must NOT
    const regData = {
      email: form.email,
      password: form.password,
      account_type: role,
      phone_number: form.phone?.trim() || undefined,
      ...(role === 'seller' && form.name?.trim() ? {
        store: {
          store_name: form.name.trim(),
          ...(form.store_description.trim() && { store_description: form.store_description.trim() }),
        }
      } : {}),
    };

    setRegistrationData(regData);

    // Step 1: Register first (creates user with is_active=False)
    registerMutation.mutate(regData, {
      onSuccess: () => {
        // Store the intended role so Navbar shows correctly even if verifyOTP doesn't echo it
        if (typeof window !== 'undefined') {
          localStorage.setItem('pending_role', role);
        }
        // Backend automatically sends the OTP during registration.
        // We just need to move to the verify step.
        toast.success("Account created! Please check your email for the verification code.");
        setRegistrationStep("otp");
      },
    });
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationData) return;
    if (otp.length !== 6) return;

    verifyOTPMutation.mutate(
      { email: registrationData.email, purpose: "register", otp },
      { onError: () => setOtp("") }
    );
  };

  const handleResendOTP = () => {
    if (!registrationData) return;

    resendOTPMutation.mutate(
      { email: registrationData.email, purpose: "register" },
      {
        onSuccess: () => {
          setOtp("");
          // Reset both timers — new OTP is fresh
          setExpiryCountdown(OTP_EXPIRY_SECONDS);
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
        },
      }
    );
  };

  const handleBackToForm = () => {
    setRegistrationStep("form");
    setOtp("");
  };

  return (
    <div className="min-h-[100dvh] bg-background flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <Image
          src={conventionImage}
          alt="Kigali landmark"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 0px"
          className="object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/75 to-background/95" />
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald/15 blur-3xl" />

        <Logo href="/" size="lg" className="z-10 relative" />

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-foreground leading-snug mb-3">
            Rwandan Local Commerce Platform
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Empowering Rwandan sellers and buyers with direct marketplace storefronts and secure escrow payments.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {[
              { icon: Lock, label: "Escrow-Protected" },
              { icon: Truck, label: "Kigali Delivery" },
              { icon: MapPin, label: "Verified Merchants" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-semibold border border-border/80">
                <Icon size={13} className="shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground text-xs relative z-10">© {new Date().getFullYear()} UbuntuNow Ltd. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="relative flex-1 flex flex-col lg:justify-center px-4 sm:px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:px-16 lg:py-12 overflow-y-auto">
        {/* Mobile-only ambience: soft brand glow behind the header */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden lg:hidden">
          <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute top-16 -right-12 h-44 w-44 rounded-full bg-emerald/10 blur-3xl" />
        </div>

        <div className="relative max-w-md w-full mx-auto my-auto">
          {/* Mobile header: back, brand, trust cues (the brand panel is desktop-only) */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                aria-label="Back to home"
                className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-secondary"
              >
                <ArrowLeft size={20} />
              </Link>
              <Logo href="/" size="lg" />
              <span className="w-11" aria-hidden />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-1">
              {[
                { icon: Lock, label: "Escrow-protected" },
                { icon: Truck, label: "Kigali delivery" },
                { icon: MapPin, label: "Verified merchants" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-secondary/70 px-2 py-1 text-[10px] font-semibold text-foreground">
                  <Icon size={10} className="shrink-0 text-accent" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <Link href="/" className="hidden lg:inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          {/* On phones the form sits in a card; on desktop it stays flat */}
          <div className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-lg backdrop-blur-sm sm:p-7 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">

          {/* Tabs */}
          {registrationStep === "form" && (
            <div className="mb-6 flex w-full rounded-xl border border-border/80 bg-secondary p-1 lg:mb-8 lg:w-fit lg:rounded-lg">
              {(["login", "register"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setRegistrationStep("form");
                    setOtp("");
                  }}
                  className={`flex-1 lg:flex-none px-5 py-2.5 lg:py-2 rounded-lg lg:rounded-md text-sm lg:text-xs font-semibold transition-all capitalize ${tab === t
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-[26px] leading-tight lg:text-2xl font-bold tracking-tight text-foreground mb-1.5">
              {registrationStep === "otp"
                ? "Verify Email Address"
                : tab === "login"
                  ? "Welcome Back"
                  : "Create Account"}
            </h1>
            <p className="text-sm lg:text-xs text-muted-foreground leading-relaxed">
              {registrationStep === "otp"
                ? `We sent a 6-digit code to ${form.email}. Enter it below to activate your account.`
                : tab === "login"
                  ? "Sign in with your email address and password."
                  : "Sign up to start buying or selling on UbuntuNow."}
            </p>
          </div>

          {/* OTP Verification Step */}
          {registrationStep === "otp" && (
            <form onSubmit={handleOTPVerify} className="space-y-6">
              {/* Icon + email */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary border border-border/80">
                  <Mail className="h-7 w-7 text-foreground" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Verification code sent to <span className="font-semibold text-foreground">{registrationData?.email}</span>
                </p>
              </div>

              {/* 6-box OTP input */}
              <OtpBoxes value={otp} onChange={setOtp} />

              {/* Expiry + progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Timer size={12} />
                    Code expires in
                  </span>
                  <span className={`font-mono font-semibold ${expiryCountdown < 60 ? "text-destructive" : "text-foreground"}`}>
                    {fmtTime(expiryCountdown)}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${expiryCountdown < 60 ? "bg-destructive" : "bg-primary"}`}
                    style={{ width: `${(expiryCountdown / OTP_EXPIRY_SECONDS) * 100}%` }}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl text-base font-semibold shadow-md"
                disabled={otp.length !== 6 || verifyOTPMutation.isPending || expiryCountdown === 0}
              >
                {verifyOTPMutation.isPending ? "Verifying…" : expiryCountdown === 0 ? "Code Expired" : "Verify & Complete Setup"}
              </Button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || resendOTPMutation.isPending}
                  className="text-xs font-semibold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                >
                  {resendOTPMutation.isPending
                    ? "Sending…"
                    : resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : "Resend Code"}
                </button>
              </div>
            </form>
          )}

          {/* Registration Form Step */}
          {registrationStep === "form" && tab === "register" && (
            <>
              {/* Role selector */}
              <div className="mb-5">
                <Label className="text-xs font-semibold text-foreground mb-2 block">Account Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: "buyer", label: "Buyer", icon: ShoppingBag, desc: "Purchase products securely" },
                      { value: "seller", label: "Seller", icon: Store, desc: "Create storefront & list items" },
                    ] as { value: Role; label: string; icon: typeof Store; desc: string }[]
                  ).map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={role === value}
                      onClick={() => setRole(value)}
                      className={`p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] ${role === value
                        ? "border-primary bg-secondary/80 ring-1 ring-primary/40 shadow-2xs"
                        : "border-border/80 bg-card hover:border-border"
                        }`}
                    >
                      <Icon size={18} className={role === value ? "text-primary mb-1.5" : "text-muted-foreground mb-1.5"} />
                      <div className="font-semibold text-xs text-foreground">{label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleRegisterFormSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    {role === 'seller' ? 'Store name' : 'Full name (optional)'}
                  </Label>
                  <Input
                    id="name"
                    autoComplete={role === "seller" ? "organization" : "name"}
                    placeholder={role === 'seller' ? 'My Awesome Store' : 'Amina Uwase'}
                    className="mt-1.5 h-12 lg:h-11 rounded-xl"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required={role === 'seller'}
                  />
                </div>

                {role === 'seller' && (
                  <>
                    <div>
                      <Label htmlFor="store_description">Store Description</Label>
                      <Textarea
                        id="store_description"
                        placeholder="Tell customers about what you sell..."
                        className="mt-1.5 rounded-xl resize-none text-base md:text-sm"
                        rows={3}
                        value={form.store_description}
                        onChange={(e) => setForm({ ...form, store_description: e.target.value })}
                      />
                    </div>


                  </>
                )}

                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="amina@example.com"
                    className="mt-1.5 h-12 lg:h-11 rounded-xl"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone number (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+250 7XX XXX XXX"
                    className="mt-1.5 h-12 lg:h-11 rounded-xl"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="h-12 lg:h-11 rounded-xl pr-12"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 rounded-xl text-base font-semibold mt-2 shadow-md"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating account..." : "Continue"}
                </Button>
              </form>
            </>
          )}

          {/* Login Form */}
          {registrationStep === "form" && tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="amina@example.com"
                  className="mt-1.5 h-12 lg:h-11 rounded-xl"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/contact" className="text-xs text-accent hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-12 lg:h-11 rounded-xl pr-12"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl text-base font-semibold mt-2 shadow-md"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Please wait..." : "Sign in"}
              </Button>
            </form>
          )}

          {registrationStep === "form" && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              {tab === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setTab(tab === "login" ? "register" : "login");
                  setRegistrationStep("form");
                  setOtp("");
                }}
                className="text-accent font-medium hover:underline"
              >
                {tab === "login" ? "Create one" : "Sign in"}
              </button>
            </p>
          )}

          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">
            By continuing, you agree to UbuntuNow&apos;s{" "}
            <Link href="/terms-of-service" className="underline">Terms</Link> &{" "}
            <Link href="/privacy-policy" className="underline">Privacy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const Auth = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Loading…</div>}>
      <AuthContent />
    </Suspense>
  );
};

export default Auth;
