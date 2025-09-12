import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { StatsService } from "./stats.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const getDashboardStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const result = await StatsService.getDashboardStats(decodedToken.userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Dashboard stats get successfully",
      data: result,
    });
  }
);

const getTransactionStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const result = await StatsService.getTransactionStats(decodedToken.userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transaction stats get successfully",
      data: result,
    });
  }
);

const getTransactionSummary = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsService.getTransactionSummary();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transaction summary get successfully",
      data: result,
    });
  }
);

export const StatsController = {
  getDashboardStats,
  getTransactionStats,
  getTransactionSummary
};

