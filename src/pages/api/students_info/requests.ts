import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

type AcademicRecord = {
  id: number;
  student_id: number;
  full_name: string;
  requests: { subject_id: number }[];
};

type AvailableSubject = {
  id: number;
  name: string;
};

type Student = {
  id: number;
  student_id: number;
  name: string;
  subjects: string[];
};

export const GET: APIRoute = async () => {
  // Fetch data from academic_records
  const { data: records, error: recordsError } = await supabase
    .from("academic_records")
    .select(`student_id, full_name, requests(subject_id)`) as {
      data: AcademicRecord[] | null;
      error: any;
    };

  if (recordsError || !records) {
    return new Response(recordsError?.message || "Error fetching records", { status: 500 });
  }

  // Get unique `subject_id`
  const subjectIds = Array.from(
    new Set(
      records.flatMap((record) => record.requests?.map((req) => req.subject_id) || [])
    )
  );

  // Fetch subjects from available_subjects
  const { data: subjects, error: subjectsError } = await supabase
    .from("available_subjects")
    .select(`id, name`)
    .in("id", subjectIds) as {
      data: AvailableSubject[] | null;
      error: any;
    };

  if (subjectsError || !subjects) {
    return new Response(subjectsError?.message || "Error fetching subjects", { status: 500 });
  }

  // Map final data
  const students: Student[] = records.map((record) => {
    const subjectsNames = record.requests?.map((req) => {
      const subject = subjects.find((sub) => sub.id === req.subject_id);
      return subject ? subject.name : "Unknown Subject";
    }) || [];
    return {
      id: record.id,
      student_id: record.student_id,
      name: record.full_name,
      subjects: subjectsNames,
    };
  });

  return new Response(JSON.stringify(students), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
