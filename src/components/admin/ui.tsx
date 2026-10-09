"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const formatMoney = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(Number(value ?? 0));

export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const formatDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm", className)}>{children}</div>;
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-muted-foreground", className)} />;
}

export function CenteredSpinner() {
  return <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-semibold text-foreground">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return (
    <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}

const TONES = {
  green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  red: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  gray: "bg-muted text-muted-foreground border-border",
} as const;

export function Pill({ tone = "gray", children }: { tone?: keyof typeof TONES; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", TONES[tone])}>
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  paid: "green", completed: "green", released: "green", confirmed: "blue", held: "blue", shipped: "blue",
  ready_for_pickup: "blue", pending: "amber", failed: "red", cancelled: "red", disputed: "red", refunded: "gray",
};

export function StatusPill({ value }: { value: string }) {
  return <Pill tone={STATUS_TONE[value] ?? "gray"}>{value.replace(/_/g, " ")}</Pill>;
}

export function RolePill({ role }: { role: string }) {
  return <Pill tone={role === "admin" ? "violet" : role === "seller" ? "green" : "blue"}>{role}</Pill>;
}

export function Pager({
  total, pageSize, offset, onChange,
}: { total: number; pageSize: number; offset: number; onChange: (offset: number) => void }) {
  if (total <= pageSize) return null;
  const page = Math.floor(offset / pageSize) + 1;
  const pages = Math.ceil(total / pageSize);
  const btn = "rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent";
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <span>Page {page} of {pages} · {total} total</span>
      <div className="flex gap-2">
        <button className={btn} disabled={offset <= 0} onClick={() => onChange(Math.max(0, offset - pageSize))}>Previous</button>
        <button className={btn} disabled={offset + pageSize >= total} onClick={() => onChange(offset + pageSize)}>Next</button>
      </div>
    </div>
  );
}

export const inputClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
export const buttonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50";
export const ghostButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50";
export const dangerButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50";

/** Debounce a rapidly changing value (search boxes). */
import { useEffect, useState } from "react";
export function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
