import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  FRONTEND_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_EXPIRES: string;
  BCRYPT_SALT_ROUND: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_PHONE?: string;
  EMAIL_SENDER: {
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_PORT: string;
    SMTP_HOST: string;
    SMTP_FROM: string;
  };
}
const envConfig: EnvConfig = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
  ADMIN_PHONE: process.env.ADMIN_PHONE as string,
  PORT: process.env.PORT as string,
  DB_URL: process.env.DB_URL as string,
  NODE_ENV:
    (process.env.NODE_ENV as "development" | "production") || "development",
  FRONTEND_URL: process.env.FRONTEND_URL as string,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "access_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh_secret",
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "1d",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "30d",
  BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND || "10",
  EMAIL_SENDER: {
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    SMTP_PORT: process.env.SMTP_PORT as string,
    SMTP_HOST: process.env.SMTP_HOST as string,
    SMTP_FROM: process.env.SMTP_FROM as string,
  },
};
export default envConfig;
