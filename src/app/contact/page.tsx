// Superseded by the "Contact" section on the landing page ("/").
import { redirect } from "next/navigation";

export default function ContactRedirect() {
  redirect("/#contact");
}
