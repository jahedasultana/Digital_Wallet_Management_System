import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { userRegisterSchema } from "./user.validation";
import { multerUpload } from "../../config/multer.config";
import { Role } from "../../types";
import { checkAuth } from "../../middlewares/authCheck";

const router = Router();

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
