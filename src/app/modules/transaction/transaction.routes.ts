// src/app/modules/transaction/transaction.route.ts

import { Router } from "express";
import { checkAuth } from "../../middlewares/authCheck";
import { Role } from "../../types";
import { TransactionControllers } from "./transaction.controller";


/**
 * @openapi
 * tags:
 *   name: Transaction
 *   description: Wallet transactions (cash-in, cash-out, history)
 */

/**
 * @openapi
 * /transaction/me:
 *   get:
 *     summary: Get logged-in user's or agent's transaction history
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   type: { type: string, enum: [cash-in, cash-out, transfer] }
 *                   amount: { type: number }
 *                   status: { type: string, enum: [pending, success, failed] }
 *                   createdAt: { type: string, format: date-time }
 *       401: { description: Unauthorized }
 */

/**
 * @openapi
 * /transaction/cash-in:
 *   post:
 *     summary: Agent cash-in (deposit money into user's wallet)
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, amount]
 *             properties:
 *               userId: { type: string, description: "ID of the user receiving cash-in" }
 *               amount: { type: number, description: "Amount to deposit" }
 *     responses:
 *       201: { description: Cash-in successful }
 *       400: { description: Invalid request / insufficient funds }
 *       401: { description: Unauthorized }
 */

/**
 * @openapi
 * /transaction/cash-out:
 *   post:
 *     summary: Agent cash-out (withdraw money from user's wallet)
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, amount]
 *             properties:
 *               userId: { type: string, description: "ID of the user withdrawing funds" }
 *               amount: { type: number, description: "Amount to withdraw" }
 *     responses:
 *       201: { description: Cash-out successful }
 *       400: { description: Invalid request / insufficient balance }
 *       401: { description: Unauthorized }
 */

/**
 * @openapi
 * /transaction:
 *   get:
 *     summary: Admin view all transactions (with optional filters)
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [cash-in, cash-out, transfer] }
 *         description: Filter by transaction type
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, success, failed] }
 *         description: Filter by transaction status
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Filter by specific user ID
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Filter transactions from this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Filter transactions up to this date (inclusive)
 *     responses:
 *       200: { description: List of all transactions (possibly filtered) }
 *       401: { description: Unauthorized }
 */


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
