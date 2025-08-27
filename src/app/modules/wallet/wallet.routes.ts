import { Router } from "express";
import { checkAuth } from "../../middlewares/authCheck";
import { Role } from "../../types";
import { WalletController } from "./wallet.controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Wallet
 *   description: Wallet management endpoints
 */

/**
 * @openapi
 * /wallet/me:
 *   get:
 *     summary: Get logged-in user's wallet details
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User wallet information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance: { type: number }
 *                 currency: { type: string }
 *       401: { description: Unauthorized }
 */

/**
 * @openapi
 * /wallet/top-up:
 *   patch:
 *     summary: Top-up wallet (User only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number }
 *     responses:
 *       200: { description: Wallet topped up successfully }
 *       400: { description: Invalid amount }
 *       401: { description: Unauthorized }
 */

/**
 * @openapi
 * /wallet/withdraw:
 *   patch:
 *     summary: Withdraw from wallet (User only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number }
 *     responses:
 *       200: { description: Withdrawal successful }
 *       400: { description: Insufficient balance or invalid amount }
 *       401: { description: Unauthorized }
 */

/**
 * @openapi
 * /wallet/send:
 *   patch:
 *     summary: Send money to another user (User only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverId, amount]
 *             properties:
 *               receiverId: { type: string }
 *               amount: { type: number }
 *     responses:
 *       200: { description: Money sent successfully }
 *       400: { description: Insufficient balance or invalid request }
 *       401: { description: Unauthorized }
 */

/**
 * @openapi
 * /wallet/:
 *   get:
 *     summary: View all wallets (Admin only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of all wallets }
 *       401: { description: Unauthorized }
 */

router.get(
  "/me",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.viewMyWallet
);

router.patch("/top-up", checkAuth(Role.USER), WalletController.topUpWallet);

router.patch(
  "/withdraw",
  checkAuth(Role.USER),
  WalletController.withdrawFromWallet
);

router.patch("/send", checkAuth(Role.USER), WalletController.sendMoney);

router.get("/", checkAuth(Role.ADMIN), WalletController.viewAllWallets);
export const WalletRoutes = router;
