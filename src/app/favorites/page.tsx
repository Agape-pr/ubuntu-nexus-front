import { redirect } from "next/navigation";

export default function FavoritesPageRedirect() {
  redirect("/wishlist");
}
