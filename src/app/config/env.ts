import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ADMIN_PHONE: string;
  FRONTEND_URL: string;
  BCRYPT_SALT_ROUND: string;
  EXPRESS_SESSION_SECRET: string;
  ADMIN_COMMISSION_RATE: string;
  AGENT_COMMISSION_RATE: string;
  AGENT_FEE_RATE: string;
  USER_FEE_RATE: string;
  USER_INITIAL_FUNDING_AMOUNT: string;
  JWT: {
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES: string;
  };
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariable: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "ADMIN_PHONE",
    "FRONTEND_URL",
    "BCRYPT_SALT_ROUND",
    "EXPRESS_SESSION_SECRET",
    "ADMIN_COMMISSION_RATE",
    "AGENT_COMMISSION_RATE",
    "AGENT_FEE_RATE",
    "USER_FEE_RATE",
    "USER_INITIAL_FUNDING_AMOUNT",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",
  ];

  requiredEnvVariable.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing require environment variable ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
    ADMIN_PHONE: process.env.ADMIN_PHONE as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
    ADMIN_COMMISSION_RATE: process.env.ADMIN_COMMISSION_RATE as string,
    AGENT_COMMISSION_RATE: process.env.AGENT_COMMISSION_RATE as string,
    AGENT_FEE_RATE: process.env.EXPRESS_SESSION_SECRET as string,
    USER_FEE_RATE: process.env.EXPRESS_SESSION_SECRET as string,
    USER_INITIAL_FUNDING_AMOUNT: process.env
      .USER_INITIAL_FUNDING_AMOUNT as string,
    JWT: {
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
      JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
      JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    },
  };
};

export const envVars = loadEnvVariables();
