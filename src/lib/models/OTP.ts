import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
    email: string;
    otp: string;
    createdAt: Date;
    expiresAt: Date;
}

const OTPSchema: Schema<IOTP> = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // auto-remove after 5 minutes (300 seconds)
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

// Optionally create TTL index for expiresAt (alternative to expires in createdAt)
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;
