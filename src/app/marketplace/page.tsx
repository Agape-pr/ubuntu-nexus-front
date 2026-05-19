// /marketplace now redirects to the root page (/)
// The marketplace is served directly at ubuntunow.rw
import { redirect } from "next/navigation";

export default function MarketplacePage() {
  redirect("/");
}
