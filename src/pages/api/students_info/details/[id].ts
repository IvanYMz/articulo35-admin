import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const GET: APIRoute = async ({ params }) => {

  const { id } = params;

  // Obtén el ID del estudiante desde los parámetros
  const studentId = id;

  // Verifica que se haya proporcionado el ID
  if (!studentId) {
    return new Response("Student ID is required", { status: 400 });
  }

  // Fetch personal data from student_profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("student_profiles")
    .select(
      `student_id, full_name, email`
    )
    .eq("student_id", studentId)
    .single();

  if (profilesError || !profiles) {
    return new Response(profilesError?.message || "Error fetching profiles", {
      status: 500,
    });
  }

  return new Response(JSON.stringify(profiles), { status: 200 });
};