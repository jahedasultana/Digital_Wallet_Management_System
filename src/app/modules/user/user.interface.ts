import { Role, UserStatus, IdentifierType, verifyStatus } from "../../types";

export interface Identifier {
  type: IdentifierType;
  value: string; 
}

export interface IUser {
  _id?: string;

  // Basic Info
  name: string;
  email: string;
  phone: string;
  password: string;
  profile_picture?: string | null; 

  // Role & Status
  role: Role;
  status: UserStatus;
  verified?: verifyStatus; 

  // Identifier for KYC verification (non-nullable)
  identifier: string;
  identifier_image?: string; 

  // Timestamps auto-managed by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}
