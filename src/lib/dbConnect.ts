import mongoose from "mongoose";

async function dbConnect(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected Successfully");
  } catch (error) {
    console.error("DB Connection Error:", error);
    throw error;
  }
}

export default dbConnect;
