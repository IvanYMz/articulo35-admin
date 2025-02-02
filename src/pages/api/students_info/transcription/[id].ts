import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

async function getSignedUrl(id: string, folder: string): Promise<string | null> {
    const { data: fileList, error: listError } = await supabase.storage
        .from("files")
        .list(`${id}/${folder}`);

    if (listError) {
        throw new Error(`Error fetching file list for folder "${folder}": ${listError.message}`);
    }

    if (!fileList || fileList.length === 0) {
        return null;  // If there are no files, we return null
    }

    const filePath = `${id}/${folder}/${fileList[0].name}`;

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("files")
        .createSignedUrl(filePath, 900);

    if (signedUrlError) {
        throw new Error(`Error creating signed URL for file "${filePath}": ${signedUrlError.message}`);
    }

    return signedUrlData.signedUrl;
}

async function getFileContent(id: string, folder: string): Promise<string | null> {
    const { data: fileList, error: listError } = await supabase.storage
        .from("files")
        .list(`${id}/${folder}`);

    if (listError) {
        throw new Error(`Error fetching file list for folder "${folder}": ${listError.message}`);
    }

    if (!fileList || fileList.length === 0) {
        return null;  // If there are no files, we return null
    }

    const filePath = `${id}/${folder}/${fileList[0].name}`;

    const { data, error } = await supabase.storage
        .from("files")
        .download(filePath);

    if (error) {
        throw new Error(`Error downloading file "${filePath}": ${error.message}`);
    }

    const content = await data.text();
    return content;
}

export const GET: APIRoute = async function ({ params }) {
    const { id } = params;

    if (!id) {
        return new Response(
            JSON.stringify({ error: "Student ID is required" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    try {
        const audioUrl = await getSignedUrl(id, "audio");
        const transcriptionContent = await getFileContent(id, "transcription");

        return new Response(
            JSON.stringify({
                audioUrl: audioUrl ?? null,  // If there's no audio, we return null
                transcriptionContent: transcriptionContent ?? null,  // If there's no transcription, we return null
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};
