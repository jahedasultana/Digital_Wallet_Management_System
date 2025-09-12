/* eslint-disable no-console */
import { envVars } from "../config/env";
import { IsActive, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";
import { IWallet, WalletStatus } from "../modules/wallet/wallet.interface";
import { Wallet } from "../modules/wallet/wallet.model";
import mongoose, { Types } from "mongoose";
import { Transaction } from "../modules/transaction/transaction.model";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "../modules/transaction/transaction.interface";

export const seedAdmin = async () => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const isAdminExist = await User.findOne({ email: envVars.ADMIN_EMAIL });

      if (isAdminExist) {
        console.log("Admin already exists.");
        return;
      }

      const hashPassword = await bcryptjs.hash(
        envVars.ADMIN_PASSWORD,
        Number(envVars.BCRYPT_SALT_ROUND)
      );

      const adminPayload: IUser = {
        name: "Admin",
        email: envVars.ADMIN_EMAIL,
        role: Role.admin,
        phone: envVars.ADMIN_PHONE,
        password: hashPassword,
        isVerified: true,
        isApproved: true,
        commissionRate: Number(envVars.ADMIN_COMMISSION_RATE),
        isActive: IsActive.active,
      };

      const [createAdmin] = await User.create([adminPayload], { session });

      if (!createAdmin) {
        throw new Error("Admin creation failed");
      }

      const walletPayload: IWallet = {
        userId: createAdmin._id,
        balance: 200000,
        currency: "BDT",
        status: WalletStatus.active,
      };

      const [createWallet] = await Wallet.create([walletPayload], { session });

      if (!createWallet) {
        throw new Error("Wallet creation failed");
      }

      const transactionPayload: ITransaction = {
        fromWalletId: createWallet._id as Types.ObjectId,
        toWalletId: createWallet._id as Types.ObjectId,
        type: TransactionType.add_money,
        status: TransactionStatus.approved,
        amount: 200000,
        commission: 0,
        currentBalance: 200000,
        initiatedBy: createAdmin._id,
        purpose: "Initial admin funding",
      };

      const [createdTransaction] = await Transaction.create(
        [transactionPayload],
        { session }
      );

      if (!createdTransaction) {
        throw new Error("Transaction creation failed");
      }

      createAdmin.walletId = createWallet._id as Types.ObjectId;
      createAdmin.transactionId = [createdTransaction._id];
      await createAdmin.save({ session });

      await session.commitTransaction();
      console.log("Admin and wallet seeded successfully.");
    });
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
  } finally {
    await session.endSession();
  }
};
