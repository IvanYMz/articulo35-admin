import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

async function getSignedUrl(id: string, folder: string): Promise<string> {
    const { data: fileList, error: listError } = await supabase.storage.from("files").list(`${id}/${folder}`);

    if (listError) {
        throw new Error(`Error fetching file list for folder "${folder}": ${listError.message}`);
    }

    if (!fileList || fileList.length === 0) {
        throw new Error(`No files found in folder "${folder}" for ID: ${id}`);
    }

    const filePath = `${id}/${folder}/${fileList[0].name}`;
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from("files").createSignedUrl(filePath, 900);

    if (signedUrlError) {
        throw new Error(`Error creating signed URL for file "${filePath}": ${signedUrlError.message}`);
    }

    return signedUrlData.signedUrl;
};

async function getFileContent(id: string, folder: string): Promise<string> {
    const { data: fileList, error: listError } = await supabase.storage.from("files").list(`${id}/${folder}`);

    if (listError) {
        throw new Error(`Error fetching file list for folder "${folder}": ${listError.message}`);
    }

    if (!fileList || fileList.length === 0) {
        throw new Error(`No files found in folder "${folder}" for ID: ${id}`);
    }

    const filePath = `${id}/${folder}/${fileList[0].name}`;
    const { data, error } = await supabase.storage.from("files").download(filePath);

    if (error) {
        throw new Error(`Error downloading file "${filePath}": ${error.message}`);
    }

    const content = await data.text();
    return content;
};

export const GET: APIRoute = async ({ params }) => {
    const { id } = params;

    if (!id) {
        return new Response(JSON.stringify({ error: "Student ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const audioUrl = await getSignedUrl(id, "audio");

        const transcriptionContent = await getFileContent(id, "transcription");

        return new Response(
            JSON.stringify({ audioUrl, transcriptionContent }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
