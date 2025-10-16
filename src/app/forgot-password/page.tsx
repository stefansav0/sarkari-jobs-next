"use client";

import React, { useState } from "react";
import {
    Box,
    Button,
    Container,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
    Alert,
    Paper,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

const steps = ["Enter Email", "Verify OTP", "Reset Password"];

type ErrorResponse = {
    message: string;
};

function getErrorMessage(error: unknown): string {
    if (isAxiosErrorWithMessage(error)) {
        return error.response!.data.message; // Non-null assertion
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "An unknown error occurred";
}

function isAxiosErrorWithMessage(
    error: unknown
): error is AxiosError<ErrorResponse> {
    return (
        typeof error === "object" &&
        error !== null &&
        "isAxiosError" in error &&
        (error as AxiosError).isAxiosError === true &&
        !!(error as AxiosError<ErrorResponse>).response?.data?.message
    );
}

const ForgotPassword = () => {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<
        "error" | "warning" | "info" | "success"
    >("info");

    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await axios.post("/api/auth/forgot-password", { email });
            setMessage(res.data.message);
            setSeverity("success");
            setStep(1);
        } catch (err: unknown) {
            setMessage(getErrorMessage(err));
            setSeverity("error");
        }
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setMessage("Please enter a valid 6-digit OTP");
            setSeverity("warning");
            return;
        }
        setMessage("");
        setStep(2);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await axios.post("/api/auth/reset-password", {
                email,
                otp,
                newPassword,
            });
            setMessage(res.data.message);
            setSeverity("success");

            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: unknown) {
            setMessage(getErrorMessage(err));
            setSeverity("error");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 4, mt: 8 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Forgot Password
                </Typography>

                <Stepper activeStep={step} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {message && (
                    <Alert severity={severity} sx={{ my: 2 }}>
                        {message}
                    </Alert>
                )}

                {step === 0 && (
                    <Box component="form" onSubmit={handleSendOtp} mt={2}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />
                        <Button fullWidth variant="contained" type="submit">
                            Send OTP
                        </Button>
                    </Box>
                )}

                {step === 1 && (
                    <Box component="form" onSubmit={handleVerifyOtp} mt={2}>
                        <TextField
                            fullWidth
                            label="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />
                        <Button fullWidth variant="contained" type="submit">
                            Verify OTP
                        </Button>
                    </Box>
                )}

                {step === 2 && (
                    <Box component="form" onSubmit={handleResetPassword} mt={2}>
                        <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />
                        <Button fullWidth variant="contained" type="submit">
                            Reset Password
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default ForgotPassword;
