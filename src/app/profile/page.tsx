"use client";

import { Suspense, useState, useEffect } from "react";
import { BuyerDashboardShell } from "@/components/BuyerDashboardShell";
import { useCurrentUser, useUpdateProfile } from "@/lib/api/hooks/useUsers";
import { useLogout } from "@/lib/api/hooks/useAuth";
import { useFavoritesStore } from "@/lib/store/favoritesStore";
import { User, MapPin, Phone, Mail, Edit3, Save, X, LogOut, ShoppingBag, CheckCircle, Heart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function ProfileContent() {
  const { data: userProfile, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const favorites = useFavoritesStore((s) => s.items);

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
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-1">Your account</p>
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

        {/* Quick actions */}
        <Link href={userProfile?.role === "seller" ? "/dashboard" : "/my-orders"}
          className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
          <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center">
            <ShoppingBag size={17} className="text-gold-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{userProfile?.role === "seller" ? "My Store" : "My Orders"}</p>
            <p className="text-xs text-white/40">
              {userProfile?.role === "seller" ? "Manage your products and orders" : "Track and manage your purchases"}
            </p>
          </div>
          <CheckCircle size={15} className="text-white/20" />
        </Link>

        {/* Favorites */}
        <Link href="/favorites" className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
          <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center">
            <Heart size={17} className="text-gold-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Favorites</p>
            <p className="text-xs text-white/40">
              {favorites.length > 0 ? `${favorites.length} saved product${favorites.length !== 1 ? "s" : ""}` : "Products you've saved"}
            </p>
          </div>
          <CheckCircle size={15} className="text-white/20" />
        </Link>

        {/* Personal Info card */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={15} className="text-gold-accent" />
              <span className="text-sm font-bold text-white">Personal Info</span>
            </div>
            {editMode ? (
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                  <X size={12} /> Cancel
                </button>
                <button onClick={handleSave} disabled={updateProfileMutation.isPending} className="text-xs text-gold-bright hover:text-gold-accent flex items-center gap-1 font-bold">
                  <Save size={12} /> {updateProfileMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditMode(true)} className="text-xs text-gold-bright hover:text-gold-accent flex items-center gap-1">
                <Edit3 size={12} /> Edit
              </button>
            )}
          </div>

          {field("First Name", form.first_name, "first_name", "e.g. Amina")}
          {field("Last Name", form.last_name, "last_name", "e.g. Uwase")}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Email</label>
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-white/30" />
              <p className="text-sm text-white/70">{email}</p>
            </div>
          </div>

          {field("Phone Number", form.phone, "phone", "+250 7XX XXX XXX")}
        </div>

        {/* Delivery Address card */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-gold-accent" />
            <span className="text-sm font-bold text-white">Delivery Address</span>
          </div>

          {field("Street / Address line 1", form.address_line1, "address_line1", "e.g. KG 123 St")}
          {field("Apartment / Suite (optional)", form.address_line2, "address_line2", "e.g. Floor 2, Apt 3")}
          {field("City", form.city, "city", "e.g. Kigali")}
          {field("Country", form.country, "country", "Rwanda")}

          {!editMode && !form.address_line1 && (
            <button onClick={() => setEditMode(true)} className="text-sm text-gold-bright hover:text-gold-accent flex items-center gap-1.5">
              <MapPin size={13} /> Add your delivery address
            </button>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => logoutMutation.mutate()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-500/30 text-rose-400 text-sm font-bold hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={15} /> Sign out
        </button>
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
