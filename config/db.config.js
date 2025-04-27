import mongoose from "mongoose";
import { ENV_VARS } from "./envVars.config.js";
export const connect = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(ENV_VARS.MONGO_URI);
    console.log("Connected to MongoDB !");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};
