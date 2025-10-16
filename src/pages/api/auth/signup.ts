// src/pages/api/auth/signup.ts

import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/sendEmail";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  console.log("Signup request body:", req.body);

  const { name, email, password } = req.body;

  // Validate existence and type
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    name.trim() === "" ||
    email.trim() === "" ||
    password.trim() === ""
  ) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Generate OTP & expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      isVerified: false,
      otp,
      otpExpires,
    });

    await newUser.save();
    console.log("New user saved:", newUser.email);

    // Send OTP email
    try {
      await sendEmail(
        email,
        "Verify Your Email - OTP",
        "",
        `<p>Hi ${name}, your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
      );
      console.log("OTP email sent to:", email);
    } catch (mailErr) {
      const err = mailErr as Error;
      console.error("Error sending OTP email:", err);
      return res.status(500).json({
        message: "Signup succeeded but failed to send OTP email.",
        error: err.message,
      });
    }

    return res.status(201).json({ message: "User registered. Check email for OTP." });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Signup failed:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
