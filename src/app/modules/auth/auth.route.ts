import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateUserZodSchema } from "../user/user.validation";

const router = Router();

router.post("/login", AuthController.credentialLogin);
router.get("/me", checkAuth(...Object.values(Role)), AuthController.getMe);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  AuthController.changePassword
);
router.post("/logout", AuthController.logout);
router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  validateRequest(updateUserZodSchema),
  AuthController.updateUser
);

export const AuthRoutes = router;
