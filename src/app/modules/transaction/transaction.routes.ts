// src/app/modules/transaction/transaction.route.ts

import { Router } from "express";
import { checkAuth } from "../../middlewares/authCheck";
import { Role } from "../../types";
import { TransactionControllers } from "./transaction.controller";

const router = Router();

// 🔐 User/Agent: View own transactions
router.get(
  "/me",
  checkAuth(Role.USER, Role.AGENT),
  TransactionControllers.getMyTransactions
);

// 💵 Agent: Cash-in
router.post("/cash-in", checkAuth(Role.AGENT), TransactionControllers.cashIn);

// 💸 Agent: Cash-out
router.post("/cash-out", checkAuth(Role.AGENT), TransactionControllers.cashOut);

// 🧑‍💼 Admin: View all transactions (with filters)
router.get(
  "/",
  checkAuth(Role.ADMIN),
  TransactionControllers.getAllTransactions
);

export const TransactionRoutes = router;
