// Superseded by the "About" section on the landing page ("/").
import { redirect } from "next/navigation";

export default function AboutRedirect() {
  redirect("/#about");
}
