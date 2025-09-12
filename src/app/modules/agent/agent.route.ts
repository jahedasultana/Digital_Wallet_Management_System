import { Router } from "express";
import { createUserZodSchema } from "../user/user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { AgentController } from "./agent.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  AgentController.registerAgent
);
router.get("/", checkAuth(...Object.values(Role)), AgentController.getAllAgent);
router.post("/approve/:id", checkAuth(Role.admin), AgentController.approve);
router.post("/suspend/:id", checkAuth(Role.admin), AgentController.suspend);

export const AgentRoutes = router;
