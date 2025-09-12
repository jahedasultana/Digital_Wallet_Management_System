import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { WalletService } from "./wallet.service";

const addMoney = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as JwtPayload;
    const result = await WalletService.addMoney(userId, req.body.amount);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Add Money Successfully",
      data: result,
    });
  }
);

const sendMoney = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as JwtPayload;
    const { walletId, amount } = req.body;
    const result = await WalletService.sendMoney(userId, walletId, amount);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Send Money Successfully",
      data: result,
    });
  }
);

const cashIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId: agentId } = req.user as JwtPayload;
    const { walletId, amount } = req.body;
    const result = await WalletService.cashIn(agentId, walletId, amount);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Cash In Successfully",
      data: result,
    });
  }
);

const cashOut = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as JwtPayload;
    const { walletId, amount } = req.body;
    const result = await WalletService.cashOut(userId, walletId, amount);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Cash Out Successfully",
      data: result,
    });
  }
);

const getSingleWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await WalletService.getSingleWallet(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Wallet retrieved successfully",
      data: result,
    });
  }
);
const getAllWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await WalletService.getAllWallet(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Wallets retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const block = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;
    const result = await WalletService.block(walletId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Wallet Block Successfully",
      data: result,
    });
  }
);

const unblock = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;
    const result = await WalletService.unblock(walletId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Wallet Unblock Successfully",
      data: result,
    });
  }
);

export const WalletController = {
  addMoney,
  sendMoney,
  cashIn,
  cashOut,
  getAllWallet,
  getSingleWallet,
  block,
  unblock,
};
