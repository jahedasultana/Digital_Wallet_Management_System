import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { TransactionService } from "./transaction.service";
import { JwtPayload } from "jsonwebtoken";

const getAllTransaction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TransactionService.getAllTransaction(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Transactions retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getMyTransactionHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await TransactionService.getMyTransactionHistory(
      decodedToken.userId, req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My all transactions retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getSingleTransaction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TransactionService.getSingleTransaction(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Single transactions retrieved successfully",
      data: result,
    });
  }
);

export const TransactionController = {
  getAllTransaction,
  getMyTransactionHistory,
  getSingleTransaction,
};
