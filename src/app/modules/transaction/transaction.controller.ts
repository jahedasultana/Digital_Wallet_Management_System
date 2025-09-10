import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { TransactionService } from "./transaction.service";
import { sendResponse } from "../../utils/sendResponse";

export const TransactionControllers = {
  // ✅ User / Agent: Get own transactions
  getMyTransactions: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const result = await TransactionService.getMyTransactions(userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User transactions retrieved successfully",
      data: result,
    });
  }),

  // ✅ Admin: Get all transactions (with filters)
  getAllTransactions: catchAsync(async (req: Request, res: Response) => {
    const query = Object.fromEntries(
      Object.entries(req.query).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(",") : String(value),
      ])
    ) as Record<string, string>;

    const result = await TransactionService.getAllTransactions(query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All transactions retrieved successfully",
      data: result,
    });
  }),

  // ✅ Agent: Cash-in
  cashIn: catchAsync(async (req: Request, res: Response) => {
    const agentId = req.user?.userId;
    const amount = req.body.amount;
    const userPhone = req.body.userPhone;

    const result = await TransactionService.cashIn(agentId, userPhone, amount);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Cash-in transaction successful",
      data: result,
    });
  }),

  // ✅ Agent: Cash-out
  cashOut: catchAsync(async (req: Request, res: Response) => {
    const agentId = req.user?.userId;
    const amount = req.body.amount;
    const userPhone = req.body.userPhone;

    const result = await TransactionService.cashOut(agentId, userPhone, amount);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Cash-out transaction successful",
      data: result,
    });
  }),

  // 🔹 NEW: Agent — Get agent-specific transactions
  getAgentTransactions: catchAsync(async (req: Request, res: Response) => {
    const agentId = req.user?.userId;

    const result = await TransactionService.getAgentTransactions(agentId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Agent transactions retrieved successfully",
      data: result,
    });
  }),

  // 🔹 NEW: Admin — Get filtered/admin-specific transactions
  getAdminTransactions: catchAsync(async (req: Request, res: Response) => {
    const filters = Object.fromEntries(
      Object.entries(req.query).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(",") : String(value),
      ])
    ) as Record<string, string>;

    const result = await TransactionService.getAdminTransactions(filters);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Admin transactions retrieved successfully",
      data: result,
    });
  }),
};
