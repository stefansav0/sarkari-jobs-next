import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

// Define the expected shape of the JWT payload
interface JwtPayload {
    id: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PUT") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        await connectDB();

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        // Use interface instead of 'any'
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const userId = decoded.id;

        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "Name and email are required." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password"); // Exclude password from returned user

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({ user: updatedUser });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Update error:", error.message);
        } else {
            console.error("Unknown update error:", error);
        }

        return res.status(500).json({ error: "Internal server error" });
    }
}
