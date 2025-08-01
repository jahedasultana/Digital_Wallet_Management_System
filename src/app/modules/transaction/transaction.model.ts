import { model, Schema } from "mongoose";
import { ITransaction } from "./transaction.interface";
import { TransactionStatus, TransactionType } from "./transaction.constant";

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", default: null },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.SUCCESS,
    },
    fee: {
      type: Number,
      required: true,
      default: 0,
    },
    commission: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
