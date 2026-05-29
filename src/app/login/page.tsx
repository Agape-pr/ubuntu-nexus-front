"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLogin } from "@/lib/api/hooks/useAuth";

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#111110] text-[#FBF8F2] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#B87800]/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-[#888780] hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="bg-[#1A1A19] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B87800] to-transparent opacity-50" />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2">Welcome Back</h1>
            <p className="text-[#888780] text-sm">Sign in to continue to UbuntuNow</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-white/90 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111110] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B87800] transition-colors placeholder:text-white/20"
                placeholder="hello@example.com"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-white/90">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#B87800] hover:text-[#F0B800] font-medium">
                  Forgot Password?
                </Link>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111110] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B87800] transition-colors placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-[#B87800] text-[#111110] py-3.5 rounded-xl font-black hover:bg-[#F0B800] transition-colors disabled:opacity-70 mt-4 shadow-lg shadow-[#B87800]/20"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#888780]">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#B87800] hover:text-[#F0B800] font-bold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
