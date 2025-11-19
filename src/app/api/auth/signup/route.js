import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    // Validate
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      name.trim() === "" ||
      email.trim() === "" ||
      password.trim() === ""
    ) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "User already exists with this email." },
        { status: 400 }
      );
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save new user
    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      isVerified: false,
      otp,
      otpExpires,
    });

    await newUser.save();

    // Send OTP email
    try {
      await sendEmail(
        email,
        "Verify Your Email - OTP",
        "",
        `<p>Hi ${name}, your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
      );
    } catch (err) {
      return NextResponse.json(
        {
          message: "Signup succeeded but failed to send OTP email.",
          error: err.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User registered. Check your email for OTP." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup failed:", error.message);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// ❌ Block other methods
export function GET() {
  return NextResponse.json(
    { message: "Method Not Allowed" },
    { status: 405 }
  );
}
