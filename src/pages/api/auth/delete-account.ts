import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

// Define the shape of your decoded JWT payload
interface JwtPayload {
    id: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        await connectDB();

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        // Validate and cast the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const userId = decoded.id;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "Account deleted successfully" });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Delete error:", error.message);
        } else {
            console.error("Unknown delete error:", error);
        }

        return res.status(500).json({ error: "Internal server error" });
    }
}
