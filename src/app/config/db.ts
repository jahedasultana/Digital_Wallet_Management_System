/* eslint-disable no-console */
// src/config/db.ts
import mongoose from "mongoose";
import envConfig from "./env";

const connectDB = async () => {
  try {
    await mongoose.connect(envConfig.DB_URL);
    console.log(`🟢 MongoDB connected at ${envConfig.NODE_ENV}`);
  } catch (error) {
    console.error("🔴 MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
