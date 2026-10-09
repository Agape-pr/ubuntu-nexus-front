"use client";

import { usePathname } from "next/navigation";
import MobileNav from "@/components/MobileNav";

/** The shopper bottom-nav must not appear in the admin console. */
export default function MobileNavGate() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <MobileNav />;
}
