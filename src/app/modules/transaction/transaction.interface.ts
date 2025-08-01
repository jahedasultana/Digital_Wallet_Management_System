import { Types } from "mongoose";
import { TransactionStatus, TransactionType } from "./transaction.constant";

export interface ITransaction {
  type: TransactionType;
  sender: Types.ObjectId | null;
  receiver: Types.ObjectId;
  amount: number;
  status: TransactionStatus;
  fee: number; // Required
  commission: number; // Required (0 if not agent)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
