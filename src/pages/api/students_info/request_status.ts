import type { APIRoute } from "astro"
import { supabase } from "../../../lib/supabase"

export const PUT: APIRoute = async function ({ request }) {
    try {
        // Getting the student_id and requestStatus from the request parameters
        const body = await request.json();
        const { student_id, requestStatus } = body;
        console.log(student_id, requestStatus);
        if (!student_id || !requestStatus) {
            return new Response("Missing parameters", { status: 400 });
        };

        // Update the request status
        const { data, error } = await supabase
            .from("requests")
            .update({ status: requestStatus })
            .eq("student_id", student_id);

        if (error) {
            console.log(error.message);
            return new Response(error.message, { status: 500 });
        };
        return new Response("Request status updated", { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    };
};