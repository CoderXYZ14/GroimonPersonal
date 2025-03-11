import mongoose from "mongoose";

// Track connection status
let isConnected = false;

async function dbConnect(): Promise<void> {
  // If already connected, return early
  if (isConnected) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("DB Connected Successfully");
  } catch (error) {
    console.error("DB Connection Error:", error);
    throw error;
  }
}

export default dbConnect;
