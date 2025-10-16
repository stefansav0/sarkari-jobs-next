"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import axios from "axios";

const VerifyOtp = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams?.get("email") || "";

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");
    const [loading, setLoading] = useState(false);

    const handleVerifyOtp = async () => {
        setLoading(true);
        setMessage("");
        setMessageType("");

        try {
            const res = await axios.post("/api/auth/verify-otp", { email, otp });

            setMessage(res.data.message);
            setMessageType("success");

            setTimeout(() => router.push("/login"), 3000);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const errorMsg =
                    err.response?.data?.message || "Verification failed. Try again.";
                setMessage(errorMsg);
            } else {
                setMessage("Verification failed. Try again.");
            }
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500 text-xl">
                    Email not found. Please sign up again.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
                <p className="mb-4 text-gray-600">
                    We’ve sent an OTP to your email:{" "}
                    <span className="font-semibold">{email}</span>
                </p>

                <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val) && val.length <= 6) {
                            setOtp(val);
                        }
                    }}
                    placeholder="Enter 6-digit OTP"
                    className="border border-gray-300 rounded px-4 py-2 w-full text-center mb-4"
                />

                <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 w-full"
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>

                {message && (
                    <p
                        className={`mt-4 text-sm ${messageType === "success" ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default VerifyOtp;
