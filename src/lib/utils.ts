import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeStoreSlug(name?: string | null): string {
  if (!name || typeof name !== "string") return "";
  const cleaned = name
    .toLowerCase()
    .trim()
    .replace(/#/g, "") // Remove '#' so URLs are not parsed as fragment anchors
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return cleaned || "store";
}

export function extractNumericStoreId(username: string): number | null {
  if (!username) return null;
  const clean = username.trim().toLowerCase();
  if (/^\d+$/.test(clean)) return parseInt(clean, 10);
  const match = clean.match(/^store-(\d+)$/);
  if (match) return parseInt(match[1], 10);
  return null;
}

