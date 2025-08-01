// src/types/index.ts or wherever your shared types live

export enum TransactionType {
  ADD = "add-money",
  WITHDRAW = "withdraw",
  SEND = "send-money",
  CASH_IN = "cash-in",
  CASH_OUT = "cash-out",
}

export enum TransactionStatus {
  SUCCESS = "success",
  PENDING = "pending",
  FAILED = "failed",
}
