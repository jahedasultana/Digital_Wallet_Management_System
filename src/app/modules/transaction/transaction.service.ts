import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Transaction } from "./transaction.model";
import { TransactionStatus, TransactionType } from "./transaction.constant";
import { Wallet } from "../wallet/wallet.model";
import { WalletStatus } from "../../types";
import { User } from "../user/user.model";
import { QueryBuilder } from "../../utils/QueryBuilders";

const checkWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet.status === WalletStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Wallet is blocked");
  }

  return wallet;
};

const getMyTransactions = async (userId: string) => {
  return Transaction.find({
    $or: [{ sender: userId }, { receiver: userId }],
  }).sort({ createdAt: -1 });
};

const getAllTransactions = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Transaction.find(), query);

  const transactionQuery = queryBuilder
    .filter()
    .search(["type", "status"])
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    transactionQuery.build().populate("sender receiver", "name email phone"),
    queryBuilder.getMeta(),
  ]);

  return { data, meta };
};

const cashIn = async (agentId: string, userPhone: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const agentWallet = await checkWallet(agentId);

  const user = await User.findOne({ phone: userPhone });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const userWallet = await checkWallet(user._id.toString());

  userWallet.balance += amount;
  const commission = amount * 0.01;
  agentWallet.balance += commission;

  const txn = new Transaction({
    type: TransactionType.CASH_IN,
    sender: agentWallet.user,
    receiver: userWallet.user,
    amount,
    fee: 0,
    commission,
    status: TransactionStatus.SUCCESS,
  });

  await Promise.all([userWallet.save(), agentWallet.save(), txn.save()]);
  return txn;
};

const cashOut = async (agentId: string, userPhone: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const agentWallet = await checkWallet(agentId);
  const user = await User.findOne({ phone: userPhone });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const userWallet = await checkWallet(user._id.toString());

  if (userWallet.balance < amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  userWallet.balance -= amount;
  const commission = amount * 0.01;
  agentWallet.balance += commission;

  const txn = new Transaction({
    type: TransactionType.CASH_OUT,
    sender: userWallet.user,
    receiver: agentWallet.user,
    amount,
    fee: 0,
    commission,
    status: TransactionStatus.SUCCESS,
  });

  await Promise.all([userWallet.save(), agentWallet.save(), txn.save()]);
  return txn;
};

export const TransactionService = {
  getMyTransactions,
  getAllTransactions,
  cashIn,
  cashOut,
};
