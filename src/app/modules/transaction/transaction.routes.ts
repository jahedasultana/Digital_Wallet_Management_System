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

const router = Router();

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
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 statusCode: { type: integer }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       type: { type: string, enum: [cash-in, cash-out, transfer] }
 *                       amount: { type: number }
 *                       status: { type: string, enum: [pending, success, failed] }
 *                       sender: { type: string }
 *                       receiver: { type: string }
 *                       createdAt: { type: string, format: date-time }
 *       401: { description: Unauthorized }
 */
router.get(
  "/me",
  checkAuth(Role.USER, Role.AGENT),
  TransactionControllers.getMyTransactions
);

/**
 * @openapi
 * /transaction/agent/me:
 *   get:
 *     summary: Get logged-in agent's transactions
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent transactions retrieved successfully
 *       401: { description: Unauthorized }
 */
router.get(
  "/agent/me",
  checkAuth(Role.AGENT),
  TransactionControllers.getAgentTransactions
);

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
 *             required:
 *               - userPhone
 *               - amount
 *             properties:
 *               userPhone: { type: string, description: "Phone number of the user receiving cash-in" }
 *               amount: { type: number, description: "Amount to deposit" }
 *     responses:
 *       201: { description: Cash-in successful }
 *       400: { description: Invalid request / insufficient funds }
 *       401: { description: Unauthorized }
 */
router.post("/cash-in", checkAuth(Role.AGENT), TransactionControllers.cashIn);

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
 *             required:
 *               - userPhone
 *               - amount
 *             properties:
 *               userPhone: { type: string, description: "Phone number of the user withdrawing funds" }
 *               amount: { type: number, description: "Amount to withdraw" }
 *     responses:
 *       201: { description: Cash-out successful }
 *       400: { description: Invalid request / insufficient balance }
 *       401: { description: Unauthorized }
 */
router.post("/cash-out", checkAuth(Role.AGENT), TransactionControllers.cashOut);

/**
 * @openapi
 * /transaction/:
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
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: End date for filtering
 *     responses:
 *       200: { description: List of all transactions (filtered or unfiltered) }
 *       401: { description: Unauthorized }
 */
router.get(
  "/",
  checkAuth(Role.ADMIN),
  TransactionControllers.getAllTransactions
);

/**
 * @openapi
 * /transaction/admin:
 *   get:
 *     summary: Admin-specific filtered transactions
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
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: End date for filtering
 *     responses:
 *       200: { description: Admin transactions retrieved successfully }
 *       401: { description: Unauthorized }
 */
router.get(
  "/admin",
  checkAuth(Role.ADMIN),
  TransactionControllers.getAdminTransactions
);

export const TransactionRoutes = router;
