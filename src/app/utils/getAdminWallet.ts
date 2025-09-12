import { ClientSession } from "mongoose";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import AppError from "../errorHelpers/AppError";
import { Wallet } from "../modules/wallet/wallet.model";
import httpStatus from "http-status-codes";

export const getAdminWallet = async (session: ClientSession) => {
  try {
    const admin = await User.findOne({ email: envVars.ADMIN_EMAIL }).session(
      session
    );
    if (!admin || !admin.walletId)
      throw new AppError(httpStatus.NOT_FOUND, "Admin not found");

    const adminWallet = await Wallet.findById(admin.walletId).session(session);
    if (!adminWallet)
      throw new AppError(httpStatus.NOT_FOUND, "Admin wallet not found");

    return adminWallet;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Admin Wallet Error ${error.message}`
    );
  }
};
