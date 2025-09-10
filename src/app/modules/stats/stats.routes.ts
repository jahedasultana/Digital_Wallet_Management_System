import { Router } from "express";
import { checkAuth } from "../../middlewares/authCheck";
import { Role } from "../../types";
import { StatController } from "./stats.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: API endpoints for fetching statistics
 */

/**
 * @swagger
 * /stats/user:
 *   get:
 *     summary: Get stats for logged-in user
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User stats retrieved successfully
 */
router.get("/user", checkAuth(Role.USER), StatController.getUserStats);

/**
 * @swagger
 * /stats/agent:
 *   get:
 *     summary: Get stats for logged-in agent
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent stats retrieved successfully
 */
router.get("/agent", checkAuth(Role.AGENT), StatController.getAgentStats);

/**
 * @swagger
 * /stats/admin:
 *   get:
 *     summary: Get stats for admin dashboard
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin stats retrieved successfully
 */
router.get("/admin", checkAuth(Role.ADMIN), StatController.getAdminStats);

export const StatRoutes = router;
