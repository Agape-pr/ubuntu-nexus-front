"use client";

import { Suspense, useState, useEffect } from "react";
import { BuyerDashboardShell } from "@/components/BuyerDashboardShell";
import { useCurrentUser, useUpdateProfile } from "@/lib/api/hooks/useUsers";
import { ArrowLeft, User, MapPin, Mail, Save, Edit3, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function PersonalInfoContent() {
  const { data: userProfile, isLoading } = useCurrentUser();

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
        toast.success("Personal info saved successfully");
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
          <div className="h-64 bg-card border border-border rounded-2xl animate-pulse" />
        </div>
      </BuyerDashboardShell>
    );
  }

  const email = userProfile?.email || "";

  return (
    <BuyerDashboardShell>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Back Button & Header */}
        <div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft size={15} /> Back to Profile
          </Link>
          <h1 className="font-display text-2xl text-white">Personal Info & Delivery Address</h1>
        </div>

        {/* Personal Info card */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={15} className="text-gold-accent" />
              <span className="text-sm font-bold text-white">Personal Information</span>
            </div>
            {editMode ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="text-xs text-white/40 hover:text-white flex items-center gap-1"
                >
                  <X size={12} /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="text-xs text-gold-bright hover:text-gold-accent flex items-center gap-1 font-bold"
                >
                  <Save size={12} /> {updateProfileMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="text-xs text-gold-bright hover:text-gold-accent flex items-center gap-1 font-semibold"
              >
                <Edit3 size={12} /> Edit Details
              </button>
            )}
          </div>

          {field("First Name", form.first_name, "first_name", "e.g. Amina")}
          {field("Last Name", form.last_name, "last_name", "e.g. Uwase")}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Email Address</label>
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
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="text-sm text-gold-bright hover:text-gold-accent flex items-center gap-1.5"
            >
              <MapPin size={13} /> Add your delivery address
            </button>
          )}
        </div>
      </div>
    </BuyerDashboardShell>
  );
}

export default function PersonalInfoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p className="text-white/40">Loading...</p></div>}>
      <PersonalInfoContent />
    </Suspense>
  );
}
