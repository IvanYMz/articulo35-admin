import type { APIRoute } from "astro";
import { supabase } from "../../../../../lib/supabase";
import type { StudentFiles } from "../../../../../types/types";

export const GET: APIRoute = async ({params}) => {
    const { id } = params;
    try {
        if (!id) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        };

        const { data: dataEvidence, error: errorEvidence } = await supabase
            .storage
            .from('files')
            .list(`${id}/documents/evidence`, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            })
        if (errorEvidence) throw errorEvidence;

        if (!dataEvidence) {
            return new Response(JSON.stringify({ error: "No files available for this user" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        };

        const evidenceFileName = dataEvidence[0].name;

        const { data: dataGuardian, error: errorFolder } = await supabase
            .storage
            .from('files')
            .list(`${id}/documents/guardianLetter`, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            })
        if (errorFolder) throw errorFolder;

        if (!dataGuardian) {
            return new Response(JSON.stringify({ error: "No files available for this user" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        };

        const letterFileName = dataGuardian[0].name;

        const { data: dataSignedUrls, error: errorSignedlUrls } = await supabase
            .storage
            .from('files')
            .createSignedUrls([`${id}/documents/evidence/${evidenceFileName}`, `${id}/documents/guardianLetter/${letterFileName}`,], 900)

        if (!dataSignedUrls) {
            return new Response(JSON.stringify({ error: "Failed to generate signed URLs" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        };

        const fileNames = [evidenceFileName, letterFileName];
        const folders = [ 'evidence', 'guardianLetter']

        const response: StudentFiles = dataSignedUrls.map((file, index) => ({
            name: fileNames[index],
            url: file.signedUrl,
            folder: folders[index],
        }));

        if (errorSignedlUrls) {
            return new Response(JSON.stringify({ error: errorSignedlUrls }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        // Catch unexpected errors and return a generic server error
        return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};