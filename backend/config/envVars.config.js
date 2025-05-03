import dotenv from "dotenv";
dotenv.config();
export const ENV_VARS = {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  SYSTEM_EMAIL: process.env.SYSTEM_EMAIL,
  SYSTEM_PASS: process.env.SYSTEM_PASS,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  YOUTUBE_API_URL: process.env.YOUTUBE_API_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};
