"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRegister } from "@/lib/api/hooks/useAuth";

export default function RegisterPage() {
  const { mutate: register, isPending } = useRegister();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    register({
      email: formData.email,
      password: formData.password,
      role: 'buyer', // default for general registration
      // If backend accepts first_name/last_name we pass it, else ignore
    }, {
      onSuccess: () => {
        // Once registered, user typically needs to verify OTP. 
        // For now, redirect to login with a success message.
        // We preserve the redirectTo param if it exists.
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get('redirectTo');
        let loginUrl = '/login';
        if (redirectTo) loginUrl += `?redirectTo=${redirectTo}`;
        
        window.location.href = loginUrl;
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#111110] text-[#FBF8F2] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#B87800]/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-lg mt-8 mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#888780] hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="bg-[#1A1A19] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B87800] to-transparent opacity-50" />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2">Create an Account</h1>
            <p className="text-[#888780] text-sm">Join UbuntuNow to buy and sell</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">First Name</label>
                <input 
                  type="text" name="first_name" required value={formData.first_name} onChange={handleChange}
                  className="w-full bg-[#111110] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B87800] transition-colors placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">Last Name</label>
                <input 
                  type="text" name="last_name" required value={formData.last_name} onChange={handleChange}
                  className="w-full bg-[#111110] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B87800] transition-colors placeholder:text-white/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white/90 mb-2">Email Address</label>
              <input 
                type="email" name="email" required value={formData.email} onChange={handleChange}
                className="w-full bg-[#111110] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B87800] transition-colors placeholder:text-white/20"
                placeholder="hello@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white/90 mb-2">Password</label>
              <input 
                type="password" name="password" required value={formData.password} onChange={handleChange}
                className="w-full bg-[#111110] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B87800] transition-colors placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white/90 mb-2">Confirm Password</label>
              <input 
                type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                className="w-full bg-[#111110] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B87800] transition-colors placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" disabled={isPending}
              className="w-full bg-[#B87800] text-[#111110] py-3.5 rounded-xl font-black hover:bg-[#F0B800] transition-colors disabled:opacity-70 mt-4 shadow-lg shadow-[#B87800]/20"
            >
              {isPending ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#888780]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#B87800] hover:text-[#F0B800] font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
