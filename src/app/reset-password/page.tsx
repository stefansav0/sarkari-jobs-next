"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Removed AxiosError import here

const ResetPassword = () => {
    const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        try {
            const res = await axios.post("/api/auth/reset-password", form);
            setMessage(res.data.message);
            setSuccess(true);
            setForm({ email: "", otp: "", newPassword: "" });

            // Redirect to login after 2.5 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2500);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setMessage(err.response?.data?.message || "Password reset failed");
            } else {
                setMessage("An unexpected error occurred");
            }
            setSuccess(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
            <h2>Reset Password</h2>
            <form onSubmit={handleReset}>
                <input
                    name="email"
                    value={form.email}
                    placeholder="Email"
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: 10, padding: 8 }}
                    type="email"
                />
                <input
                    name="otp"
                    value={form.otp}
                    placeholder="OTP"
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: 10, padding: 8 }}
                    maxLength={6}
                    pattern="\d{6}"
                    title="Please enter a valid 6-digit OTP"
                />
                <input
                    name="newPassword"
                    type="password"
                    value={form.newPassword}
                    placeholder="New Password"
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: 10, padding: 8 }}
                    minLength={6}
                />
                <button type="submit" style={{ width: "100%", padding: 10 }}>
                    Reset Password
                </button>
            </form>
            {message && (
                <p style={{ marginTop: 10, color: success ? "green" : "red" }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default ResetPassword;
