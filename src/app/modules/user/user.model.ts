import { Schema, model } from "mongoose";
import { IUser } from "./user.interface";
import { Role, UserStatus, IdentifierType, verifyStatus } from "../../types";

const userSchema = new Schema<IUser>(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    profile_picture: {
      type: String,
      required: false,
      default: null,
    },

    // Role & Status
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    verified: {
      type: String,
      enum: Object.values(verifyStatus),
      default: verifyStatus.PENDING,
    },

    // Identifier as a flat object, no nested Schema
    identifier: {
      type: String,
      enum: Object.values(IdentifierType),
      required: true,
    },
    identifier_image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
