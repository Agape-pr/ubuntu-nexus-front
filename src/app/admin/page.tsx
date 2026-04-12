"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/api/hooks/useUsers";
import { useAdminUsers, useAdminUserDetail, useCreateAdminUser } from "@/lib/api/hooks/useAdmin";
import { AdminUser, AdminUserFilters, AdminUserCreatePayload } from "@/lib/api/services/admin";
import {
  Users, Store, ShoppingBag, Search, X, Shield,
  ChevronRight, Loader2, Mail, Phone, Calendar,
  CheckCircle, XCircle, ExternalLink, ArrowLeft, Plus,
} from "lucide-react";
import { toast } from "sonner";

// ── RBAC Utils ───────────────────────────────────────────────────────────────

export const hasPermission = (user: any, permission: string) => {
  if (!user) return false;
  if (user.is_superuser) return true;
  return user.admin_permissions?.includes(permission) ?? false;
};

// ── helpers ──────────────────────────────────────────────────────────────────

const roleConfig = {
  admin:  { label: "Admin",  color: "bg-violet-100 text-violet-700 border-violet-200" },
  seller: { label: "Seller", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  buyer:  { label: "Buyer",  color: "bg-blue-100 text-blue-700 border-blue-200" },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = roleConfig[role as keyof typeof roleConfig] ?? { label: role, color: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ── User detail drawer ────────────────────────────────────────────────────────

function UserDrawer({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { data: user, isLoading } = useAdminUserDetail(userId);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      {/* panel */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
        <div className="flex items-center gap-3 p-6 border-b border-slate-100">
          <button onClick={onClose} className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ArrowLeft size={16} className="text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-900 text-lg">User Profile</h2>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : !user ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Failed to load user.</div>
        ) : (
          <div className="p-6 flex flex-col gap-6">
            {/* Avatar + identity */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl font-bold text-primary select-none flex-shrink-0">
                {user.email.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg leading-tight mb-1">{user.email}</div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={user.role} />
                  {user.is_active ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <CheckCircle size={12} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                      <XCircle size={12} /> Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
              <DetailRow icon={Mail} label="Email" value={user.email} />
              <DetailRow icon={Phone} label="Phone" value={user.phone_number || "—"} />
              <DetailRow icon={Calendar} label="Joined" value={formatDate(user.date_joined)} />
              <DetailRow icon={Calendar} label="Last login" value={formatDate(user.last_login)} />
            </div>

            {/* Store (sellers only) */}
            {user.role === 'seller' && (
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-4">
                  <Store size={14} /> Store Profile
                </div>
                {user.store ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Store Name</p>
                      <p className="font-semibold text-slate-900">{user.store.store_name}</p>
                    </div>
                    {user.store.slug && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Store URL</p>
                        <Link
                          href={`https://www.ubuntunow.rw/store/${user.store.slug}`}
                          target="_blank"
                          className="text-sm font-mono text-primary hover:underline flex items-center gap-1"
                        >
                          /store/{user.store.slug} <ExternalLink size={12} />
                        </Link>
                      </div>
                    )}
                    {user.store.store_description && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Description</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{user.store.store_description}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Store profile not created yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-400" />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 mt-0.5">{value}</p>
      </div>
    </div>
// ── Add User Drawer ───────────────────────────────────────────────────────────

function AddUserDrawer({ onClose, user }: { onClose: () => void, user: any }) {
  const mutation = useCreateAdminUser();
  const [formData, setFormData] = useState<AdminUserCreatePayload>({
    email: "",
    password: "",
    role: "buyer",
    admin_permissions: [],
  });

  const [isSuperuser, setIsSuperuser] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    
    // If they are not superuser but role is admin, ensure we pass selected permissions
    if (formData.role === 'admin' && !isSuperuser) {
      // Keep whatever permissions are selected
    } else {
      payload.admin_permissions = []; // clear if not an admin or if superuser
    }

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success("User created successfully");
        onClose();
      },
      onError: (err: any) => {
        toast.error("Failed to create user: " + (err?.message || "Unknown error"));
      }
    });
  };

  const togglePermission = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      admin_permissions: prev.admin_permissions?.includes(perm)
        ? prev.admin_permissions.filter(p => p !== perm)
        : [...(prev.admin_permissions || []), perm]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      {/* panel */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
        <div className="flex items-center gap-3 p-6 border-b border-slate-100">
          <button onClick={onClose} disabled={mutation.isPending} className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-900 text-lg">Add User</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 flex-1">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <Input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Initial Password</label>
              <Input type="password" required minLength={8} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Role</label>
              <div className="flex gap-2">
                {(['buyer', 'seller', ...(hasPermission(user, 'is_superuser') ? ['admin'] : [])] as const).map(r => (
                  <button
                    key={r} type="button"
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={`flex-1 py-2 text-sm font-bold border rounded-xl transition-all ${formData.role === r ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* RBAC Options for Admin */}
            {formData.role === 'admin' && (
              <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">Admin Permissions</p>
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={isSuperuser} onChange={e => setIsSuperuser(e.target.checked)} className="mt-1 accent-violet-600 w-4 h-4 rounded" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Super Admin</p>
                    <p className="text-xs text-slate-500 leading-snug">Full access to everything. Can create other admins.</p>
                  </div>
                </label>

                {!isSuperuser && (
                  <div className="pl-7 space-y-3 pt-2">
                    {[
                      { id: 'manage_buyers', label: 'Manage Buyers' },
                      { id: 'manage_sellers', label: 'Manage Sellers & Stores' },
                      { id: 'manage_products', label: 'Manage Products & Orders' }
                    ].map(perm => (
                      <label key={perm.id} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.admin_permissions?.includes(perm.id)} onChange={() => togglePermission(perm.id)} className="accent-violet-600 w-4 h-4 rounded" />
                        <span className="font-medium text-slate-700 text-sm">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-auto pt-6">
            <Button type="submit" disabled={mutation.isPending} className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold text-sm">
              {mutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useCurrentUser();

  const [filters, setFilters] = useState<AdminUserFilters>({ role: "", search: "" });
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Gate: redirect non-admins
  if (!meLoading && me && me.role !== "admin") {
    router.replace("/");
    return null;
  }

  // Apply search with a small debounce-on-submit approach
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(f => ({ ...f, search }));
  };

  const { data: users = [], isLoading } = useAdminUsers(filters);
  const totalCount = users.length;

  const sellerCount = users.filter(u => u.role === "seller").length;
  const buyerCount  = users.filter(u => u.role === "buyer").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="container max-w-6xl mx-auto px-4 py-10 flex-1">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <Shield size={18} className="text-violet-600" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Platform Management</p>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage all users, sellers, and buyer accounts.</p>
          </div>

          <Button onClick={() => setIsAddUserOpen(true)} className="h-10 bg-slate-900 text-white rounded-xl font-bold text-sm px-4 gap-2">
            <Plus size={16} /> Add User
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-violet-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{meLoading || isLoading ? "…" : totalCount}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</div>
            </div>
          </div>

          {hasPermission(me, 'manage_sellers') && (
            <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Store size={20} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{meLoading || isLoading ? "…" : sellerCount}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sellers</div>
              </div>
            </div>
          )}

          {hasPermission(me, 'manage_buyers') && (
            <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{meLoading || isLoading ? "…" : buyerCount}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Buyers</div>
              </div>
            </div>
          )}
        </div>

        {/* Filters + search */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Role filter tabs */}
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => setFilters(f => ({ ...f, role: "" }))} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filters.role === "" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>All</button>
            
            {hasPermission(me, 'manage_sellers') && (
              <button onClick={() => setFilters(f => ({ ...f, role: "seller" }))} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filters.role === "seller" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>Seller</button>
            )}
            
            {hasPermission(me, 'manage_buyers') && (
              <button onClick={() => setFilters(f => ({ ...f, role: "buyer" }))} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filters.role === "buyer" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>Buyer</button>
            )}

            <button onClick={() => setFilters(f => ({ ...f, role: "admin" }))} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filters.role === "admin" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>Admin</button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by email…"
                className="h-9 rounded-xl pl-8 text-sm border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
            {search && (
              <button type="button" onClick={() => { setSearch(""); setFilters(f => ({ ...f, search: "" })); }}
                className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X size={14} className="text-slate-500" />
              </button>
            )}
            <Button type="submit" size="sm" className="h-9 rounded-xl bg-slate-900 text-white px-4 text-xs font-semibold">
              Search
            </Button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isLoading ? "Loading…" : `${totalCount} user${totalCount !== 1 ? "s" : ""}`}
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
              <Loader2 size={28} className="animate-spin" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-center gap-3 text-slate-400">
              <Users size={32} className="text-slate-200" />
              <p className="font-semibold text-slate-600">No users found</p>
              <p className="text-sm">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {/* Table head */}
              <div className="grid grid-cols-[1fr_4rem_6rem_5rem_3rem] gap-4 px-6 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>User</span>
                <span className="hidden sm:block">Phone</span>
                <span>Joined</span>
                <span>Status</span>
                <span />
              </div>

              {users.filter(u => {
                // Front-end RBAC masking (hide rows if no permission)
                if (u.role === 'seller' && !hasPermission(me, 'manage_sellers')) return false;
                if (u.role === 'buyer' && !hasPermission(me, 'manage_buyers')) return false;
                return true;
              }).map((user: AdminUser) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className="w-full grid grid-cols-[1fr_4rem_6rem_5rem_3rem] gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors text-left items-center"
                >
                  {/* Identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0 select-none">
                      {user.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900 truncate">{user.email}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <RoleBadge role={user.role} />
                        {user.role === "seller" && user.store && (
                          <span className="text-[11px] text-slate-400 truncate hidden sm:inline">{user.store.store_name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <span className="text-xs text-slate-500 hidden sm:block truncate">{user.phone_number || "—"}</span>

                  {/* Joined */}
                  <span className="text-xs text-slate-500">{formatDate(user.date_joined)}</span>

                  {/* Status */}
                  <span>
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle size={11} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                        <XCircle size={11} /> Inactive
                      </span>
                    )}
                  </span>

                  {/* Arrow */}
                  <ChevronRight size={14} className="text-slate-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User detail drawer */}
      {selectedUserId && (
        <UserDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}

      {/* Add user drawer */}
      {isAddUserOpen && (
        <AddUserDrawer onClose={() => setIsAddUserOpen(false)} user={me} />
      )}
    </div>
  );
}
