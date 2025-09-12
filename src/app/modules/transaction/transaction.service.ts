import mongoose, { ClientSession, Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IWallet } from "../wallet/wallet.interface";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";
import { Transaction } from "./transaction.model";
import httpStatus from "http-status-codes";
import { pushTransactionToUser } from "../../utils/pushTransactionToUser";
import { findUserAndWallet } from "../../utils/findUserAndWallet";
import { Role } from "../user/user.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

const createTransaction = async (
  transactionPayload: ITransaction,
  session?: ClientSession
) => {
  try {
    const [transaction] = await Transaction.create([transactionPayload], {
      new: true,
      runValidators: true,
      session,
    });
    return transaction;
  } catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Transaction failed!");
  }
};

const initialFunding = async (
  updatedAdminWallet: IWallet,
  updatedUserWallet: IWallet,
  initialFundingAmount: number,
  session: ClientSession
) => {
  try {
    const [adminTransaction, userTransaction] = await Promise.all([
      createTransaction(
        {
          fromWalletId: updatedAdminWallet._id,
          toWalletId: updatedUserWallet._id as Types.ObjectId,
          amount: initialFundingAmount,
          commission: 0,
          status: TransactionStatus.approved,
          type: TransactionType.send_money,
          currentBalance: updatedAdminWallet.balance,
          initiatedBy: updatedAdminWallet.userId,
          purpose: "Initial funding to new user",
        },
        session
      ),
      createTransaction(
        {
          fromWalletId: updatedAdminWallet._id,
          toWalletId: updatedUserWallet._id as Types.ObjectId,
          amount: initialFundingAmount,
          commission: 0,
          status: TransactionStatus.approved,
          type: TransactionType.cash_in,
          currentBalance: updatedUserWallet.balance,
          initiatedBy: updatedUserWallet.userId,
          purpose: "Initial admin funding",
        },
        session
      ),
    ]);

    await pushTransactionToUser(
      updatedAdminWallet.userId,
      adminTransaction._id,
      session
    );

    const user = await User.findByIdAndUpdate(
      updatedUserWallet.userId,
      { $push: { transactionId: userTransaction._id } },
      { new: true, runValidators: true, session }
    )
      .populate("walletId", "balance")
      .populate("transactionId", "fromWalletId type")
      .select("-password");

    return user;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Initial Funding failed!"
    );
  }
};

const addMoney = async (
  wallet: IWallet,
  amount: number,
  session: ClientSession
) => {
  try {
    const addMoneyTransaction = await createTransaction(
      {
        toWalletId: wallet._id as Types.ObjectId,
        amount: amount,
        status: TransactionStatus.approved,
        type: TransactionType.add_money,
        currentBalance: wallet.balance,
        initiatedBy: wallet.userId,
        purpose: "Self",
      },
      session
    );

    await pushTransactionToUser(
      wallet.userId,
      addMoneyTransaction._id,
      session
    );

    return addMoneyTransaction;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Add Money Transaction failed!"
    );
  }
};

const cashIn = async (
  agentWallet: IWallet,
  userWallet: IWallet,
  amount: number,
  session: ClientSession
) => {
  try {
    const { user } = await findUserAndWallet(userWallet.userId, session);
    const [cashIn, receiveMoney] = await Promise.all([
      createTransaction(
        {
          fromWalletId: agentWallet._id,
          toWalletId: userWallet._id as Types.ObjectId,
          amount: amount,
          status: TransactionStatus.approved,
          type:
            user.role === Role.agent
              ? TransactionType.cash_in
              : TransactionType.send_money,
          currentBalance: agentWallet.balance,
          initiatedBy: agentWallet.userId,
        },
        session
      ),
      createTransaction(
        {
          fromWalletId: agentWallet._id,
          toWalletId: userWallet._id as Types.ObjectId,
          amount: amount,
          status: TransactionStatus.approved,
          type: TransactionType.receive_money,
          currentBalance: userWallet.balance,
          initiatedBy: userWallet.userId,
        },
        session
      ),
    ]);

    await Promise.all([
      pushTransactionToUser(agentWallet.userId, cashIn._id, session),
      pushTransactionToUser(userWallet.userId, receiveMoney._id, session),
    ]);

    return cashIn;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Add Money Transaction failed!"
    );
  }
};

const cashOut = async (
  userWallet: IWallet,
  agentWallet: IWallet,
  adminWallet: IWallet,
  amount: number,
  feeAmount: number,
  session: ClientSession
) => {
  try {
    const [cashOutTransaction, withdrawTransaction, feeTransaction] =
      await Promise.all([
        createTransaction(
          {
            fromWalletId: userWallet._id,
            toWalletId: agentWallet._id as Types.ObjectId,
            amount: amount,
            fee: feeAmount,
            status: TransactionStatus.approved,
            type: TransactionType.cash_in,
            currentBalance: userWallet.balance,
            initiatedBy: agentWallet.userId,
          },
          session
        ),
        createTransaction(
          {
            fromWalletId: userWallet._id,
            toWalletId: agentWallet._id as Types.ObjectId,
            amount: amount,
            status: TransactionStatus.approved,
            type: TransactionType.withdraw,
            currentBalance: agentWallet.balance,
            initiatedBy: userWallet.userId,
          },
          session
        ),

        createTransaction(
          {
            fromWalletId: userWallet._id,
            toWalletId: adminWallet._id as Types.ObjectId,
            amount: feeAmount,
            status: TransactionStatus.approved,
            type: TransactionType.fee,
            currentBalance: adminWallet.balance,
            initiatedBy: userWallet.userId,
          },
          session
        ),
      ]);

    await Promise.all([
      pushTransactionToUser(
        agentWallet.userId,
        cashOutTransaction._id,
        session
      ),
      pushTransactionToUser(
        userWallet.userId,
        withdrawTransaction._id,
        session
      ),
      pushTransactionToUser(adminWallet.userId, feeTransaction._id, session),
    ]);

    return cashOutTransaction;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Cash Out Transaction failed!"
    );
  }
};

const getAllTransaction = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Transaction.find().populate({
    path: "fromWalletId",
    select: "userId",
    populate: {
      path: "userId",
      select: "phone",
    },
  }).populate({
    path: "toWalletId",
    select: "userId",
    populate: {
      path: "userId",
      select: "phone",
    },
  }), query);

  const transactions = queryBuilder.filter().fields().paginate();

  const [data, meta] = await Promise.all([
    transactions.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getMyTransactionHistory = async (userId: string, query: Record<string, string>) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.transactionId || !Array.isArray(user.transactionId) || user.transactionId.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "Transaction Not Found");
  }

  const queryBuilder = new QueryBuilder(
    Transaction.find({ _id: user.transactionId }).populate({
      path: "fromWalletId",
      select: "userId",
      populate: {
        path: "userId",
        select: "phone",
      },
    }).populate({
      path: "toWalletId",
      select: "userId",
      populate: {
        path: "userId",
        select: "phone",
      },
    }),
    query
  );

  const transactions = queryBuilder.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([
    transactions.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};


const getSingleTransaction = async (id: string) => {
  return await Transaction.findById(id).populate("initiatedBy", "name role")
};

export const TransactionService = {
  createTransaction,
  initialFunding,
  addMoney,
  cashIn,
  cashOut,
  getAllTransaction,
  getMyTransactionHistory,
  getSingleTransaction
};
