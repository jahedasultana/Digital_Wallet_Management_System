// src/app/validators/user.validation.ts

import { z } from "zod";
import { bdPhoneRegex, IdentifierType, Role, UserStatus } from "../../types";

export const userRegisterSchema = z.object({
  // Basic Info
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(bdPhoneRegex, "Invalid Bangladeshi phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  identifier: z.string(),

  // Role & Status
  role: z.enum([Role.USER, Role.AGENT]).optional().default(Role.USER),
});

export const userUpdateSchema = z.object({
  // Basic Info
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  email: z.email().optional(),
  phone: z
    .string()
    .regex(bdPhoneRegex, "Invalid Bangladeshi phone number")
    .optional(),
  profile_picture: z.url("Invalid profile picture URL").optional(),

  // Role & Status
  role: z.enum([Role.USER, Role.AGENT]).optional(),
  status: z
    .enum([
      UserStatus.ACTIVE,
      UserStatus.BLOCKED,
      UserStatus.INACTIVE,
      UserStatus.SUSPENDED,
    ])
    .optional(),

  // Identifier
  identifier: z
    .object({
      type: z.enum([IdentifierType.NID, IdentifierType.BIRTH_CERTIFICATE]),
      value: z.url().optional(),
    })
    .optional(),
});

export const userLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6, " Password must be at least 6 characters"),
});
