import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { userRegisterSchema } from "./user.validation";
import { multerUpload } from "../../config/multer.config";
import { Role } from "../../types";
import { checkAuth } from "../../middlewares/authCheck";

const router = Router();

/**
 * @openapi
 * tags:
 *   name: User
 *   description: User and agent management endpoints
 */

/**
 * @openapi
 * /user/register:
 *   post:
 *     summary: Register a new user (with profile and identifier images)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [user, agent] }
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *               identifier_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: User created successfully }
 *       400: { description: Validation or upload error }
 */

/**
 * @openapi
 * /user/:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of all users }
 *       401: { description: Unauthorized }
 */

/**
 * @openapi
 * /user/{id}/block:
 *   patch:
 *     summary: Block a user's wallet (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     responses:
 *       200: { description: User wallet blocked successfully }
 *       401: { description: Unauthorized }
 */

/**
 * @openapi
 * /user/{id}/unblock:
 *   patch:
 *     summary: Unblock a user's wallet (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     responses:
 *       200: { description: User wallet unblocked successfully }
 *       401: { description: Unauthorized }
 */

/**
 * @openapi
 * /user/{id}/approve:
 *   patch:
 *     summary: Approve an agent account (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Agent ID
 *     responses:
 *       200: { description: Agent approved successfully }
 *       401: { description: Unauthorized }
 */

/**
 * @openapi
 * /user/{id}/suspend:
 *   patch:
 *     summary: Suspend an agent account (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Agent ID
 *     responses:
 *       200: { description: Agent suspended successfully }
 *       401: { description: Unauthorized }
 */

router.post(
  "/register",
  multerUpload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "identifier_image", maxCount: 1 },
  ]),
  validateRequest(userRegisterSchema),
  UserControllers.createUser
);

router.get("/", checkAuth(Role.ADMIN), UserControllers.getAllUsers);

router.patch(
  "/:id/block",
  checkAuth(Role.ADMIN),
  UserControllers.blockUserWallet
);

router.patch(
  "/:id/unblock",
  checkAuth(Role.ADMIN),
  UserControllers.unblockUserWallet
);

router.patch(
  "/:id/approve",
  checkAuth(Role.ADMIN),
  UserControllers.approveAgent
);

router.patch(
  "/:id/suspend",
  checkAuth(Role.ADMIN),
  UserControllers.suspendAgent
);

export const UserRoutes = router;
