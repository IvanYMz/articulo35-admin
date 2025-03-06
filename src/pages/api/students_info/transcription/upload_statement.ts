import { supabase } from "../../../../lib/supabase";
import type { APIRoute } from "astro";

// Endpoint to upload audio file
export const PUT: APIRoute = async ({ request }) => {
    try {
        // Get the form data
        const formData = await request.formData();
        const file = formData.get("audio") as File;
        const audioFileName = formData.get("audioFileName") as string;
        const textFileName = formData.get("textFileName") as string;
        const id = formData.get("id") as string;

        // Remove existing audio file
        const { error: removeAudioError } = await supabase.storage
            .from('files')
            .remove([`${id}/audio/${audioFileName}`]);

        if (removeAudioError) {
            throw removeAudioError;
        };

        // Remove existing text file
        const { error: removeTextError } = await supabase.storage
            .from('files')
            .remove([`${id}/transcription/${textFileName}`]);

        if (removeTextError) {
            throw removeTextError;
        };

        if (!file || !id) {
            return new Response(JSON.stringify({ error: "Missing file or ID" }), { status: 400 });
        }

        // Set the file path
        const filePath = `${id}/audio/${file.name}`;

        // Upload file to Supabase storage
        const { error } = await supabase.storage
            .from("files")
            .upload(filePath, file, { upsert: true });

        if (error) {
            throw error;
        }

        return new Response(JSON.stringify('Audio uploaded successfully!'), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
};
