// All the global types used in the app
// User Roles uses in this app
export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}
// User Statuses used in this app
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  BLOCKED = "BLOCKED",
}
export enum verifyStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export enum IdentifierType {
  NID = "NID",
  BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE",
}
export enum WalletStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  FROZEN ="FROZEN"
}

// src/types/index.ts or wherever your shared types live

export const bdPhoneRegex = /^(\+8801|01)[0-9]{9}$/;

export interface ResetPasswordPayload {
  id: string;
  token: string;
  newPassword: string;
}