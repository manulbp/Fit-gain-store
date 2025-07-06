import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("MongoDB connected to fit gain database"));
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};