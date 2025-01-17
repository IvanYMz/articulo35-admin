import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response("Student ID is required", { status: 400 });
  }

  const { data: personalData, error: profilesError } = await supabase
    .from("student_profiles")
    .select(`student_id, full_name, email`)
    .eq("student_id", id)
    .single();

  if (profilesError || !personalData) {
    return new Response(profilesError?.message || "Error fetching personal data", {
      status: 500,
    });
  }

  const { data: academicRecords, error: recordsError } = await supabase
    .from("academic_records")
    .select(`student_code, career, average_score, enrollment_cycle, graduation_cycle, approved_credits, pending_credits, division`)
    .eq("student_id", id)
    .single();

  if (recordsError || !academicRecords) {
    return new Response(recordsError?.message || "Error fetching academic records", {
      status: 500
    });
  }

  const { data: fileData, error: fileError } = await supabase
    .from("files")
    .select(`file_path`)
    .eq("student_id", id)
    .single();

  if (fileError || !fileData) {
    return new Response(fileError?.message || "Error fetching file data", {
      status: 500
    });
  }

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
    
    filePath: fileData.file_path,
  };

  return new Response(JSON.stringify(studentDetails), { status: 200 });
};
