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
 *   - name: User
 *     description: User and agent management endpoints
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, agent]
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *               identifier_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation or upload error
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

/**
 * @openapi
 * /user:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of all users with pagination info
 *       401:
 *         description: Unauthorized
 */
router.get("/", checkAuth(Role.ADMIN), UserControllers.getAllUsers);

/**
 * @openapi
 * /user/me:
 *   get:
 *     summary: View own profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Own profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/me",
  checkAuth(...Object.values(Role)),
  UserControllers.getMyProfile
);

/**
 * @openapi
 * /user/me:
 *   patch:
 *     summary: Update own profile (name, phone, password, profile picture)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: User not found
 */
router.patch(
  "/me",
  checkAuth(...Object.values(Role)),
  multerUpload.single("profile_picture"),
  UserControllers.updateProfile
);

/**
 * @openapi
 * /user/{id}:
 *   get:
 *     summary: Get a single user by ID (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/:id", checkAuth(Role.ADMIN), UserControllers.getUserById);

/**
 * @openapi
 * /user/{id}:
 *   patch:
 *     summary: Update a user by ID (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, PENDING, SUSPENDED, BLOCKED]
 *               verified:
 *                 type: string
 *                 enum: [VERIFIED, UNVERIFIED]
 *             example:
 *               name: John Doe
 *               email: john@example.com
 *               phone: 1234567890
 *               status: ACTIVE
 *               verified: VERIFIED
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch("/:id", checkAuth(Role.ADMIN), UserControllers.updateUserById);

/**
 * @openapi
 * /user/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID to delete
 *     responses:
 *       200: { description: User deleted successfully }
 *       401: { description: Unauthorized }
 */
router.delete("/:id", checkAuth(Role.ADMIN), UserControllers.deleteUser);

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
 *         description: User ID to block wallet
 *     responses:
 *       200: { description: Wallet blocked successfully }
 *       401: { description: Unauthorized }
 */
router.patch(
  "/:id/block",
  checkAuth(Role.ADMIN),
  UserControllers.blockUserWallet
);

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
 *         description: User ID to unblock wallet
 *     responses:
 *       200: { description: Wallet unblocked successfully }
 *       401: { description: Unauthorized }
 */
router.patch(
  "/:id/unblock",
  checkAuth(Role.ADMIN),
  UserControllers.unblockUserWallet
);

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
 *         description: Agent user ID to approve
 *     responses:
 *       200: { description: Agent approved successfully }
 *       401: { description: Unauthorized }
 */
router.patch(
  "/:id/approve",
  checkAuth(Role.ADMIN),
  UserControllers.approveAgent
);

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
 *         description: Agent user ID to suspend
 *     responses:
 *       200: { description: Agent suspended successfully }
 *       401: { description: Unauthorized }
 */
router.patch(
  "/:id/suspend",
  checkAuth(Role.ADMIN),
  UserControllers.suspendAgent
);

export const UserRoutes = router;
