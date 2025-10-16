import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectDB();
        res.status(200).json({ message: "DB connected successfully" });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: "DB connection failed", error: err.message });
        } else {
            res.status(500).json({ message: "DB connection failed", error: String(err) });
        }
    }
}
