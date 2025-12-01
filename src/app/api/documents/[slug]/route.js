import { connectDB } from "@/lib/db";
import Document from "@/lib/models/Document";

// CORS (required for DELETE + GET from other domains)
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// --- OPTIONS (Preflight) ---
export async function OPTIONS() {
    return new Response(null, { status: 200, headers: corsHeaders });
}

// --- GET DOCUMENT BY SLUG ---
export async function GET(req, { params }) {
    try {
        await connectDB();

        const { slug } = params;

        const document = await Document.findOne({ slug });

        if (!document) {
            return new Response(
                JSON.stringify({ message: "Document not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        return new Response(JSON.stringify(document), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (error) {
        return new Response(
            JSON.stringify({
                message: "❌ Error fetching document",
                error: error.message,
            }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// --- DELETE DOCUMENT BY SLUG ---
export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const { slug } = params;

        const deleted = await Document.findOneAndDelete({ slug });

        if (!deleted) {
            return new Response(JSON.stringify({ message: "Document not found" }), {
                status: 404,
                headers: corsHeaders,
            });
        }

        return new Response(
            JSON.stringify({ message: "Document deleted successfully" }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({
                message: "❌ Error deleting document",
                error: error.message,
            }),
            { status: 500, headers: corsHeaders }
        );
    }
}
