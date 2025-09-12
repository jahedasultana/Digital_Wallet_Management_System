import { Document, Types } from "mongoose";

export enum WalletStatus {
  active = "active",
  blocked = "blocked",
}

export interface IWallet {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  currency: "BDT";
  status: WalletStatus;
}

