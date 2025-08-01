// src/app/modules/transaction/transaction.validation.ts

import { z } from "zod";

const amountSchema = z
  .number({
    error: "Amount is required",
  })
  .positive("Amount must be greater than 0");

const sendSchema = z.object({
  body: z.object({
    amount: amountSchema,
    receiverPhone: z
      .string({
        error: "Receiver phone is required",
      })
      .min(11, "Phone number must be at least 11 digits")
      .nonempty("Receiver phone is required"),
  }),
});

const cashInSchema = z.object({
  body: z.object({
    amount: amountSchema,
    userPhone: z
      .string({
        error: "User phone is required",
      })
      .min(11, "Phone number must be at least 11 digits"),
  }),
});

const cashOutSchema = z.object({
  body: z.object({
    amount: amountSchema,
    userPhone: z
      .string({
        error: "User phone is required",
      })
      .min(11, "Phone number must be at least 11 digits"),
  }),
});

export const TransactionValidation = {
  sendSchema,
  cashInSchema,
  cashOutSchema,
};
