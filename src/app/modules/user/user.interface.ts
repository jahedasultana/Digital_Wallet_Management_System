import { Role, UserStatus, IdentifierType, verifyStatus } from "../../types";

export interface Identifier {
  type: IdentifierType;
  value: string; // URL of the uploaded KYC document image
}

export interface IUser {
  _id?: string;

  // Basic Info
  name: string;
  email: string;
  phone: string;
  password: string;
  profile_picture?: string | null; // optional or null if not uploaded yet

  // Role & Status
  role: Role;
  status: UserStatus;
  verified?: verifyStatus; // optional, defaults to PENDING

  // Identifier for KYC verification (non-nullable)
  identifier: string;
  identifier_image?: string; // URL of the uploaded identifier image

  // Timestamps auto-managed by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}
