// This standalone page has been superseded by the "Orders" tab inside /dashboard.
import { redirect } from "next/navigation";

export default function SellerOrdersRedirect() {
  redirect("/dashboard");
}
