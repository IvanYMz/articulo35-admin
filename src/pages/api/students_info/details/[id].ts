import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

// Endpoint to get the student's personal data, academic records, and requests
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  try {
    // Promise.all to run all Supabase queries in parallel improving performance by reducing the total waiting time
    const [
      { data: personalData, error: profilesError },
      { data: academicRecords, error: recordsError },
      { data: requests, error: requestsError },
    ] = await Promise.all([
      supabase
        .from("student_profiles")
        .select(`student_id, full_name, email`)
        .eq("student_id", id)
        .single(),
      supabase
        .from("academic_records")
        .select(`student_code, career, average_score, enrollment_cycle, graduation_cycle, approved_credits, pending_credits, division`)
        .eq("student_id", id)
        .single(),
      supabase
        .from("requests")
        .select(`subject_id, status, description, available_subjects (name, nrc)`)
        .eq("student_id", id),
    ]);

    // Check for errors in any of the queries
    if (profilesError || recordsError || requestsError) {
      return new Response(
        profilesError?.message || recordsError?.message || requestsError?.message || "Error fetching data",
        { status: 500 }
      );
    }

    // Ensure that all required data is present
    if (!personalData || !academicRecords || !requests) {
      return new Response("Data not found", { status: 404 });
    }

    // Construct the response object with the fetched data
    const studentDetails = {
      personalData: {
        student_id: personalData.student_id,
        full_name: personalData.full_name,
        email: personalData.email,
      },
      academicRecords: {
        student_code: academicRecords.student_code,
        career: academicRecords.career,
        average_score: academicRecords.average_score,
        enrollment_cycle: academicRecords.enrollment_cycle,
        graduation_cycle: academicRecords.graduation_cycle,
        approved_credits: academicRecords.approved_credits,
        pending_credits: academicRecords.pending_credits,
        division: academicRecords.division,
      },
      requests: requests.map((request) => ({
        subject_id: request.subject_id,
        status: request.status,
        description: request.description,
        available_subjects: request.available_subjects,
      })),
    };

    // Return the response as JSON with a 200 status code
    return new Response(JSON.stringify(studentDetails), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle unexpected errors (e.g., network issues, Supabase downtime)
    return new Response("Internal Server Error", { status: 500 });
  }
};