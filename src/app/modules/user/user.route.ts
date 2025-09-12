import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.registerUser
);
router.get("/", checkAuth(...Object.values(Role)), UserController.getAllUser);
router.get("/:id", checkAuth(Role.admin), UserController.getSingleUserOrAgent);


export const UserRoutes = router;
