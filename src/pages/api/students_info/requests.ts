import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import type { AcademicRecord, AvailableSubject, Student } from "../../../types/types";

async function fetchAcademicRecords(): Promise<AcademicRecord[]> {
  const { data, error } = await supabase
    .from("academic_records")
    .select(`student_id, full_name, requests(subject_id, status)`)
    .not("requests", "is", null);  // Filter out records without requests

  if (error) {
    throw new Error(error.message);
  }
  return data as AcademicRecord[];
}


async function fetchAvailableSubjects(subjectIds: number[]): Promise<AvailableSubject[]> {
  const { data, error } = await supabase
    .from("available_subjects")
    .select(`id, name`)
    .in("id", subjectIds);

  if (error) {
    throw new Error(error.message);
  }
  return data as AvailableSubject[];
}

function mapStudents(records: AcademicRecord[], subjects: AvailableSubject[]): Student[] {
  const subjectMap = new Map(subjects.map(subject => [subject.id, subject.name]));

  return records.map(record => ({
      id: record.id,
      student_id: record.student_id,
      name: record.full_name,
      subjects: record.requests?.map(req => ({
          name: subjectMap.get(req.subject_id) || "Unknown Subject",
          status: req.status || "Unknown Status",
      })) || [],
  }));
}


export const GET: APIRoute = async function () {
  try {
    const records = await fetchAcademicRecords();

    // Extract unique subject IDs from the records
    const subjectIds = Array.from(
      new Set(
        records.flatMap(function (record) {
          return record.requests?.map(function (req) {
            return req.subject_id;
          }) || [];
        })
      )
    );

    const subjects = await fetchAvailableSubjects(subjectIds);

    const students = mapStudents(records, subjects);

    // Return the student data as a JSON response
    return new Response(JSON.stringify(students), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle errors and return an appropriate response
    return new Response(
      error instanceof Error ? error.message : "An unexpected error occurred",
      { status: 500 }
    );
  }
};