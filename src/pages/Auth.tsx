import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, ArrowLeft, Store, ShoppingBag, Mail, ArrowRight, Upload } from "lucide-react";
import { useLogin, useRegister, useSendOTP, useVerifyOTP, useResendOTP } from "@/lib/api/hooks/useAuth";
import { toast } from "sonner";

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

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = (searchParams.get("tab") as Tab) || "login";
  const defaultRole = (searchParams.get("role") as Role) || "buyer";

  const [tab, setTab] = useState<Tab>(defaultTab);
  const [role, setRole] = useState<Role>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>("form");
  const [form, setForm] = useState<{
    name: string; email: string; password: string; phone: string; store_description: string; store_logo: File | string | null;
  }>({ name: "", email: "", password: "", phone: "", store_description: "", store_logo: null });
  const [otp, setOtp] = useState("");
  const [registrationData, setRegistrationData] = useState<{
    email: string;
    password: string;
    account_type: Role;
    phone_number?: string;
    store?: { store_name: string; store_description?: string; store_logo?: File | string };
  } | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const sendOTPMutation = useSendOTP();
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
          ...(form.store_logo && { store_logo: form.store_logo }),
        }
      } : {}),
    };

    setRegistrationData(regData);

    // Step 1: Register first (creates user with is_active=False)
    registerMutation.mutate(regData, {
      onSuccess: () => {
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

    // Step 3: Verify OTP - backend activates user and returns tokens (user is logged in)
    verifyOTPMutation.mutate(
      {
        email: registrationData.email,
        purpose: "register",
        otp: otp,
      },
      {
        onError: () => setOtp(""),
      }
    );
  };

  const handleResendOTP = () => {
    if (!registrationData) return;

    resendOTPMutation.mutate({
      email: registrationData.email,
      purpose: "register",
    });
  };

  const handleBackToForm = () => {
    setRegistrationStep("form");
    setOtp("");
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
          {registrationStep === "form" && (
            <div className="flex bg-secondary rounded-xl p-1 mb-8 w-fit">
              {(["login", "register"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setRegistrationStep("form");
                    setOtp("");
                  }}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${tab === t
                    ? "bg-card shadow-card text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {t === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {registrationStep === "otp"
                ? "Verify your email"
                : tab === "login"
                  ? "Welcome back"
                  : "Join UbuntuNow"}
            </h1>
            <p className="text-muted-foreground">
              {registrationStep === "otp"
                ? `We've sent a verification code to ${form.email}. Please check your inbox.`
                : tab === "login"
                  ? "Sign in to access your store and orders."
                  : "Create your account and start in minutes."}
            </p>
          </div>

          {/* OTP Verification Step */}
          {registrationStep === "otp" && (
            <form onSubmit={handleOTPVerify} className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div>
                <Label htmlFor="otp">Enter verification code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  className="mt-1.5 h-11 rounded-xl text-center text-2xl tracking-widest font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl text-base font-semibold mt-2"
                disabled={otp.length !== 6 || verifyOTPMutation.isPending || registerMutation.isPending}
              >
                {verifyOTPMutation.isPending
                  ? "Verifying code..."
                  : registerMutation.isPending
                    ? "Creating account..."
                    : "Verify & Create Account"}
              </Button>

              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Back to form
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendOTPMutation.isPending}
                  className="text-sm text-accent hover:underline"
                >
                  {resendOTPMutation.isPending ? "Sending..." : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {/* Registration Form Step */}
          {registrationStep === "form" && tab === "register" && (
            <>
              {/* Role selector */}
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
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${role === value
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

              <form onSubmit={handleRegisterFormSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    {role === 'seller' ? 'Store name' : 'Full name (optional)'}
                  </Label>
                  <Input
                    id="name"
                    placeholder={role === 'seller' ? 'My Awesome Store' : 'Amina Uwase'}
                    className="mt-1.5 h-11 rounded-xl"
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
                        className="mt-1.5 rounded-xl resize-none"
                        rows={3}
                        value={form.store_description}
                        onChange={(e) => setForm({ ...form, store_description: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="store_logo">Store Logo (optional)</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="store_logo"
                          type="file"
                          accept="image/*"
                          className="h-11 py-2 px-3 rounded-xl border border-input file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-sm"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Ensure it's under a reasonable size (10MB)
                              if (file.size > 10 * 1024 * 1024) {
                                toast.error('Logo must be less than 10MB');
                                e.target.value = '';
                                return;
                              }
                              // Store the actual File object instead of base64 string for FormData upload
                              setForm({ ...form, store_logo: file });
                            } else {
                              setForm({ ...form, store_logo: null });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </>
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
                    required
                  />
                </div>

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

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 rounded-xl pr-11"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
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
                  placeholder="amina@example.com"
                  className="mt-1.5 h-11 rounded-xl"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs text-accent hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 rounded-xl pr-11"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
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
