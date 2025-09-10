import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { WalletService } from "./wallet.service";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { WalletStatus } from "../../types";

const viewMyWallet = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await WalletService.getWalletByUserId(user.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wallet retrieved successfully",
    data: result,
  });
});

const viewAgentWallet = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user as JwtPayload;
  const result = await WalletService.getWalletByUserId(agent.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agent wallet retrieved successfully",
    data: result,
  });
});

const topUpWallet = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const { amount } = req.body;
  const result = await WalletService.topUp(user.userId, amount);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Money added successfully",
    data: result,
  });
});

const withdrawFromWallet = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const { amount } = req.body;
  const result = await WalletService.withdraw(user.userId, amount);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Withdrawal successful",
    data: result,
  });
});

const sendMoney = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const { amount, receiverPhone } = req.body;
  const result = await WalletService.sendMoney(
    user.userId,
    receiverPhone,
    amount
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Money sent successfully",
    data: result,
  });
});

const viewAllWallets = catchAsync(async (_req: Request, res: Response) => {
  const result = await WalletService.getAllWallets();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All wallets retrieved",
    data: result,
  });
});

const getWalletStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await WalletService.getWalletStatistics();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wallet statistics retrieved successfully",
    data: result,
  });
});

const updateWalletStatus = catchAsync(async (req: Request, res: Response) => {
  const { walletId, status } = req.params;
  const updatedWalletStatus = status as WalletStatus;

  const result = await WalletService.updateWalletStatus(
    walletId,
    updatedWalletStatus
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Wallet status updated to ${status} successfully`,
    data: result,
  });
});

export const WalletController = {
  viewMyWallet,
  viewAgentWallet,
  topUpWallet,
  withdrawFromWallet,
  sendMoney,
  viewAllWallets,
  getWalletStats,
  updateWalletStatus,
};
