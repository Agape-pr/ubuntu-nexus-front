"use client";

import { Suspense, useState, useEffect } from "react";
import { BuyerDashboardShell } from "@/components/BuyerDashboardShell";
import { useCurrentUser, useUpdateProfile } from "@/lib/api/hooks/useUsers";
import { useLogout } from "@/lib/api/hooks/useAuth";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { User, MapPin, Phone, Mail, Edit3, Save, X, LogOut, ShoppingBag, CheckCircle, Heart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function ProfileContent() {
  const { data: userProfile, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const wishlist = useWishlistStore((s) => s.items);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    country: "Rwanda",
  });

  // Pre-fill from profile when loaded
  useEffect(() => {
    if (userProfile) {
      setForm({
        first_name:    userProfile.first_name  || "",
        last_name:     userProfile.last_name   || "",
        phone:         (userProfile as any).phone_number || "",
        address_line1: (userProfile as any).address_line1 || "",
        address_line2: (userProfile as any).address_line2 || "",
        city:          (userProfile as any).city  || "Kigali",
        country:       (userProfile as any).country || "Rwanda",
      });
    }
  }, [userProfile]);

  const updateProfileMutation = useUpdateProfile();

  const handleSave = () => {
    updateProfileMutation.mutate({
      first_name: form.first_name,
      last_name: form.last_name,
      phone_number: form.phone,
      address_line1: form.address_line1,
      address_line2: form.address_line2,
      city: form.city,
      country: form.country,
    }, {
      onSuccess: () => {
        toast.success("Profile saved successfully");
        setEditMode(false);
      }
    });
  };

  const field = (label: string, value: string, key: keyof typeof form, placeholder?: string) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</label>
      {editMode ? (
        <input
          className="w-full h-11 px-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-bright/30 placeholder:text-white/20"
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder || label}
        />
      ) : (
        <p className={`text-sm font-medium ${value ? "text-white/90" : "text-white/25 italic"}`}>
          {value || "Not set"}
        </p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <BuyerDashboardShell>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <div className="h-6 w-32 bg-secondary rounded animate-pulse" />
          <div className="h-24 bg-card border border-border rounded-2xl animate-pulse" />
          <div className="h-64 bg-card border border-border rounded-2xl animate-pulse" />
          <div className="h-48 bg-card border border-border rounded-2xl animate-pulse" />
        </div>
      </BuyerDashboardShell>
    );
  }

  const email = userProfile?.email || "";
  const displayName = [form.first_name, form.last_name].filter(Boolean).join(" ") || email.split("@")[0];
  const roleLabel = userProfile?.role
    ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)
    : "Buyer";

  return (
    <BuyerDashboardShell>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl text-white">Profile</h1>
        </div>

        {/* Avatar + Name */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gold-bright/20 border border-gold-bright/30 flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-gold-accent">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-lg truncate">{displayName}</p>
            <p className="text-sm text-white/40 truncate">{email}</p>
            <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-bright/20 text-gold-accent border border-gold-bright/30">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Quick action: Personal Info & Delivery Address */}
        <Link href="/profile/personal-info" className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors group">
          <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <User size={17} className="text-gold-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white group-hover:text-gold-bright transition-colors">Personal Info</p>
            <p className="text-xs text-white/40 truncate">Name, phone number & delivery address</p>
          </div>
          <CheckCircle size={15} className="text-white/20 group-hover:text-gold-accent transition-colors" />
        </Link>

        {/* Quick action: My Orders / My Store */}
        <Link href={userProfile?.role === "seller" ? "/dashboard" : "/my-orders"}
          className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors group">
          <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <ShoppingBag size={17} className="text-gold-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white group-hover:text-gold-bright transition-colors">{userProfile?.role === "seller" ? "My Store" : "My Orders"}</p>
            <p className="text-xs text-white/40 truncate">
              {userProfile?.role === "seller" ? "Manage your products and orders" : "Track and manage your purchases"}
            </p>
          </div>
          <CheckCircle size={15} className="text-white/20 group-hover:text-gold-accent transition-colors" />
        </Link>

        {/* Wishlist */}
        <Link href="/wishlist" className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors group">
          <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <Heart size={17} className="text-gold-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white group-hover:text-gold-bright transition-colors">Wishlist</p>
            <p className="text-xs text-white/40 truncate">
              {wishlist.length > 0 ? `${wishlist.length} saved product${wishlist.length !== 1 ? "s" : ""}` : "Products in your wishlist"}
            </p>
          </div>
          <CheckCircle size={15} className="text-white/20 group-hover:text-gold-accent transition-colors" />
        </Link>

        {/* Logout */}
        <div className="pt-2">
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-500/30 text-rose-400 text-sm font-bold hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>
    </BuyerDashboardShell>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p className="text-white/40">Loading...</p></div>}>
      <ProfileContent />
    </Suspense>
  );
}
