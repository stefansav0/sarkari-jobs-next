import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is missing from environment variables");
}

// Global cached connection (prevents multiple connections in dev)
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    // console.log("🟢 Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    // console.log("🔵 Creating new MongoDB connection...");

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 10,                  // Safe pool
        serverSelectionTimeoutMS: 5000,   // Important for Vercel SRV fix
        socketTimeoutMS: 45000,
      })
      .then((mongoose) => {
        console.log("🟢 MongoDB Connected!");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
