// Superseded by /auth, which handles OTP verification and buyer/seller role selection.
import { redirect } from "next/navigation";

export default function LoginRedirect() {
  redirect("/auth");
}
