import { connectDB } from "@/lib/db";
import StudyNews from "@/lib/models/StudyNews"; // Ensure this is correct

export default async function handler(req, res) {
    await connectDB(); // Ensure this connects successfully

    if (req.method === "GET") {
        const { slug } = req.query; // Ensure the client sends this as a query param

        try {
            const newsItem = await StudyNews.findOne({ slug });

            if (!newsItem) {
                return res.status(404).json({ message: "Study news not found" });
            }

            return res.status(200).json(newsItem);
        } catch (error) {
            console.error("❌ Error fetching study news:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    } else {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
