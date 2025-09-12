import { ClientSession, Types } from "mongoose";
import { User } from "../modules/user/user.model";
import AppError from "../errorHelpers/AppError";
import { Wallet } from "../modules/wallet/wallet.model";
import httpStatus from "http-status-codes";

export const findUserAndWallet = async (
  userId: string | Types.ObjectId,
  session: ClientSession
) => {
  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    const wallet = await Wallet.findById(user.walletId).session(session);
    if (!wallet) throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");

    return { user, wallet };
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, `User Error ${error.message}`);
  }
};
