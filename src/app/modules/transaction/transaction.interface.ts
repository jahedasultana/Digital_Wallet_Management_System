import { Types } from "mongoose";

export enum TransactionType {
  add_money = "add_money",
  withdraw = "withdraw",
  send_money = "send_money",
  cash_in = "cash_in",
  cash_out = "cash_out",
  receive_money = "receive_money",
  fee = "fee",
}

export enum TransactionStatus {
  pending = "pending",
  approved = "approved",
  declined = "declined",
}

export interface ITransaction {
  _id?: Types.ObjectId;
  fromWalletId?: Types.ObjectId;
  toWalletId: Types.ObjectId;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee?: number;
  commission?: number;
  currentBalance: number;
  initiatedBy: Types.ObjectId;
  purpose?: string;
}
