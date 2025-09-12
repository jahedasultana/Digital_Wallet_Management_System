import { Types } from "mongoose";

export enum Role {
  admin = "admin",
  user = "user",
  agent = "agent",
}

export enum IsActive {
  active = "active",
  blocked = "blocked",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  role: Role;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isActive?: IsActive;
  isVerified?: boolean;
  isDeleted?: boolean;
  walletId?: Types.ObjectId; 
  transactionId?: Types.ObjectId[]
  isApproved?: boolean;
  feeRate?: number;
  commissionRate?: number;
}
