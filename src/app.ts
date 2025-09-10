// src/app.ts
// All imports
import express, { Application, Request, Response } from "express";
import cors from "cors";
import envConfig from "./app/config/env";
import cookieParser from "cookie-parser";
import httpStatus from "http-status-codes";
import notFound from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { router } from "./app/routes";
import { setupSwagger } from "./swagger"; // ✅ add this

const app: Application = express();

const allowedOrigins = [
  envConfig.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "https://digital-wallet-management-client.vercel.app"
];

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies
  })
);

// Entry point for routes
app.use("/api/v1", router);

// Swagger Docs ✅
setupSwagger(app);

// Application Entry Point
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the Dream Wallet API",
    status: httpStatus.OK,
    data: {
      version: "1.0.0",
      description: "API for managing digital wallets",
    },
  });
});

// Global Error Handler
app.use(globalErrorHandler);
// Not Found Handler
app.use(notFound);

export default app;
