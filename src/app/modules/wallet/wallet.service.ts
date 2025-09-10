import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

import { Wallet } from "./wallet.model";
import { WalletStatus } from "../../types";
import { User } from "../user/user.model";
import { Transaction } from "../transaction/transaction.model";
import {
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.constant";

const checkWalletValid = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet.status === WalletStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Your wallet is blocked");
  }

  return wallet;
};

const getWalletByUserId = async (userId: string) => {
  return checkWalletValid(userId);
};

const topUp = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await checkWalletValid(userId);

    wallet.balance += amount;
    await wallet.save({ session });

    const trx = await Transaction.create(
      [
        {
          type: TransactionType.ADD,
          sender: null,
          receiver: userId,
          amount,
          fee: 0,
          commission: 0,
          status: TransactionStatus.SUCCESS,
          notes: "Top-up",
        },
      ],
      { session }
    );

    if (!trx || trx.length === 0) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Transaction failed"
      );
    }

    await session.commitTransaction();
    session.endSession();

    return wallet;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const withdraw = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await checkWalletValid(userId);

    if (wallet.balance < amount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    wallet.balance -= amount;
    await wallet.save({ session });

    const trx = await Transaction.create(
      [
        {
          type: TransactionType.WITHDRAW,
          sender: userId,
          receiver: userId,
          amount,
          fee: 0,
          commission: 0,
          status: TransactionStatus.SUCCESS,
          notes: "Withdraw",
        },
      ],
      { session }
    );

    if (!trx || trx.length === 0) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Transaction failed"
      );
    }

    await session.commitTransaction();
    session.endSession();

    return wallet;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const sendMoney = async (
  senderId: string,
  receiverPhone: string,
  amount: number
) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const senderWallet = await checkWalletValid(senderId);

    if (senderWallet.balance < amount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    const receiverUser = await User.findOne({ phone: receiverPhone });
    if (!receiverUser) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");
    }

    const receiverWallet = await checkWalletValid(receiverUser._id.toString());

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await Promise.all([
      senderWallet.save({ session }),
      receiverWallet.save({ session }),
    ]);

    const trx = await Transaction.create(
      [
        {
          type: TransactionType.SEND,
          sender: senderId,
          receiver: receiverUser._id,
          amount,
          fee: 0,
          commission: 0,
          status: TransactionStatus.SUCCESS,
          notes: "Send money",
        },
      ],
      { session }
    );

    if (!trx || trx.length === 0) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Transaction failed"
      );
    }

    await session.commitTransaction();
    session.endSession();

    return {
      senderBalance: senderWallet.balance,
      receiverBalance: receiverWallet.balance,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const getAllWallets = async () => {
  return Wallet.find({});
};

const getWalletStatistics = async () => {
  const totalWallets = await Wallet.countDocuments();
  const totalBalanceAgg = await Wallet.aggregate([
    { $group: { _id: null, totalBalance: { $sum: "$balance" } } },
  ]);
  const totalBalance = totalBalanceAgg[0]?.totalBalance || 0;

  const activeWallets = await Wallet.countDocuments({
    status: WalletStatus.ACTIVE,
  });
  const blockedWallets = await Wallet.countDocuments({
    status: WalletStatus.BLOCKED,
  });

  return {
    totalWallets,
    totalBalance,
    activeWallets,
    blockedWallets,
  };
};

const updateWalletStatus = async (walletId: string, status: WalletStatus) => {
  if (!Object.values(WalletStatus).includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid wallet status");
  }

  const wallet = await Wallet.findById(walletId);
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  wallet.status = status;
  await wallet.save();

  return wallet;
};

export const WalletService = {
  getWalletByUserId,
  topUp,
  withdraw,
  sendMoney,
  getAllWallets,
  getWalletStatistics,
  updateWalletStatus,
};
