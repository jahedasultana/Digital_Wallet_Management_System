import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "../transaction/transaction.model";
import { Role } from "../../types";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { TransactionType } from "../transaction/transaction.constant";

const getUserStats = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const wallet = await Wallet.findOne({ user: userId });

  const totalTransactions = await Transaction.countDocuments({
    $or: [{ sender: userId }, { receiver: userId }],
  });

  const totalSent = await Transaction.aggregate([
    { $match: { sender: user._id } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalReceived = await Transaction.aggregate([
    { $match: { receiver: user._id } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return {
    userId,
    balance: wallet?.balance || 0,
    totalTransactions,
    totalSent: totalSent[0]?.total || 0,
    totalReceived: totalReceived[0]?.total || 0,
  };
};

const getAgentStats = async (agentId: string) => {
  const agent = await User.findById(agentId);
  if (!agent || agent.role !== Role.AGENT) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid agent");
  }

  const totalCashIn = await Transaction.aggregate([
    { $match: { receiver: agent._id, type: TransactionType.CASH_IN } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalCashOut = await Transaction.aggregate([
    { $match: { sender: agent._id, type: TransactionType.CASH_OUT } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalCommission = await Transaction.aggregate([
    { $match: { $or: [{ sender: agent._id }, { receiver: agent._id }] } },
    { $group: { _id: null, total: { $sum: "$commission" } } },
  ]);

  const usersServed = await Transaction.distinct("receiver", {
    sender: agent._id,
  });

  return {
    agentId,
    totalCashIn: totalCashIn[0]?.total || 0,
    totalCashOut: totalCashOut[0]?.total || 0,
    totalCommission: totalCommission[0]?.total || 0,
    usersServed: usersServed.length,
  };
};

const getAdminStats = async () => {
  // Users
  const totalUsers = await User.countDocuments({ role: Role.USER });
  const totalAgents = await User.countDocuments({ role: Role.AGENT });

  const activeUsers = await User.countDocuments({
    role: Role.USER,
    status: "ACTIVE",
    verified: "VERIFIED",
  });

  const pendingApproval = await User.countDocuments({
    role: Role.USER,
    verified: "PENDING",
  });

  const suspendedUsers = await User.countDocuments({
    role: Role.USER,
    status: { $in: ["SUSPENDED", "BLOCKED"] },
  });

  // Transactions
  const totalTransactions = await Transaction.countDocuments();

  const totalTransactionVolume = await Transaction.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalRevenue = await Transaction.aggregate([
    { $group: { _id: null, total: { $sum: "$fee" } } },
  ]);

  return {
    totalUsers,
    activeUsers,
    pendingApproval,
    suspendedUsers,
    totalAgents,
    totalTransactions,
    totalTransactionVolume: totalTransactionVolume[0]?.total || 0,
    totalRevenue: totalRevenue[0]?.total || 0,
  };
};

export const StatServices = {
  getUserStats,
  getAgentStats,
  getAdminStats,
};
