import { supabase } from "../../../lib/supabase";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Sign out from Supabase
  await supabase.auth.signOut();

  // Delete auth cookies
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });

  // Redirect to sign-in page
  return redirect("/signin");
};
