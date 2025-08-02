import { Types } from "mongoose";
import { WalletStatus } from "../../types";

export interface IWallet {
  user: Types.ObjectId; 
  balance: number; 
  status: WalletStatus; 
  createdAt?: Date; 
  updatedAt?: Date; 
}
