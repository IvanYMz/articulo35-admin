// TESTING PATHS FOR AUDIO AND TEXT/PDF FILES 
import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const GET: APIRoute = async ({ params }) => {

    const { id } = params;

    if (!id) {
        return new Response("Student ID is required", { status: 400 });
    }

    const { data: audioFileData, error: audioFileError } = await supabase
        .storage
        .from("files")
        .list(`${id}/audio`);

    if (audioFileError) {
        return new Response(audioFileError.message, { status: 500 });
    }

    const path1 = id + '/audio/' + audioFileData[0].name;

    console.log(path1);

    const { data: audio, error: audioError } = await supabase.storage.from('files').createSignedUrl(path1, 900);

    if (audioError) {
        return new Response(audioError.message, { status: 500 });
    }
    console.log(audio.signedUrl);

    //-----------------------------------------------------------------------------------

    const { data: transcriptionData, error: transcriptionError } = await supabase
        .storage
        .from("files")
        .list(`${id}/transcription`);

    if (transcriptionError) {
        return new Response(transcriptionError.message, { status: 500 });
    }

    const path = id + '/transcription/' + transcriptionData[0].name;

    console.log(path);

    const { data, error } = await supabase.storage.from('files').createSignedUrl(path, 900);

    if (error) {
        return new Response(error.message, { status: 500 });
    }
    console.log(data.signedUrl);

    //-----------------------------------------------------------------------------------

    return new Response(JSON.stringify(transcriptionData), { status: 200, headers: { "Content-Type": "application/json" }, });
};
