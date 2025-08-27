import { Schema, model } from "mongoose";
import { IWallet } from "./wallet.interface";
import { WalletStatus } from "../../types";

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 50, // default balance on user registration
    },
    status: {
      type: String,
      enum: Object.values(WalletStatus),
      default: WalletStatus.ACTIVE,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
