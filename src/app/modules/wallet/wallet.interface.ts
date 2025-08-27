import { Types } from "mongoose";
import { WalletStatus } from "../../types";

export interface IWallet {
  user: Types.ObjectId; // Reference to User
  balance: number; // Available balance
  status: WalletStatus; // Whether wallet is blocked
  createdAt?: Date; // Auto timestamp
  updatedAt?: Date; // Auto timestamp
}
