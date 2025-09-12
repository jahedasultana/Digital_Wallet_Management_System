import { model, Schema } from "mongoose";
import { IsActive, IUser, Role } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: Object.values(Role) },
    password: { type: String },
    phone: { type: String, required: true, unique: true },
    picture: { type: String },
    address: { type: String, trim: true },
    feeRate: { type: Number,},
    commissionRate: { type: Number },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.active,
    },
    isApproved: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    transactionId: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);
