import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    // Get form data
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return new Response(
        `<script>alert("Por favor, ingresa tu correo y contraseña."); window.location.href = "/signin";</script>`, 
        { status: 400, headers: { "Content-Type": "text/html; charset=UTF-8" } }
      );
    }

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error de autenticación:", error.message);
      return new Response(
        `<script>alert("Correo o contraseña incorrectos. Verifica tus credenciales e intenta nuevamente."); window.location.href = "/signin";</script>`, 
        { status: 401, headers: { "Content-Type": "text/html; charset=UTF-8" } }
      );
    }

    if (!data?.session) {
      console.warn("Sesión no creada después del inicio de sesión.");
      return new Response(
        `<script>alert("Hubo un problema con la sesión. Inténtalo de nuevo más tarde."); window.location.href = "/signin";</script>`, 
        { status: 500, headers: { "Content-Type": "text/html; charset=UTF-8" } }
      );
    }

    // Set access token and refresh token in cookies
    const { access_token, refresh_token } = data.session;
    cookies.set("sb-access-token", access_token, {
      path: "/",
    });
    cookies.set("sb-refresh-token", refresh_token, {
      path: "/",
    });

    // Get user role
    const { data: userRole, error: userError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (userError) {
      console.error("Error obteniendo rol del usuario:", userError.message);
      cookies.delete("sb-access-token", { path: "/" });
      cookies.delete("sb-refresh-token", { path: "/" });
      return new Response(
        `<script>alert("No se pudo verificar tu rol. Inténtalo de nuevo."); window.location.href = "/signin";</script>`, 
        { status: 500, headers: { "Content-Type": "text/html; charset=UTF-8" } }
      );
    }

    if (userRole?.role === "administrator") {
      return redirect("/");
    }

    // Si el usuario no es administrador, borra los tokens y redirige
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });

    return new Response(
      `<script>alert("No tienes permisos para acceder. Contacta con el administrador."); window.location.href = "/signin";</script>`, 
      { status: 403, headers: { "Content-Type": "text/html; charset=UTF-8" } }
    );
  } catch (error) {
    console.error("Error inesperado:", error);
    return new Response(
      `<script>alert("Ocurrió un error inesperado. Inténtalo de nuevo."); window.location.href = "/signin";</script>`, 
      { status: 500, headers: { "Content-Type": "text/html; charset=UTF-8" } }
    );
  }
};
