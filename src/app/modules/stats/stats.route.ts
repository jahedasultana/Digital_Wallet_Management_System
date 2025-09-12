import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { StatsController } from "./stats.controller";

const router = Router();


router.get("/dashboard-stats", checkAuth(Role.admin), StatsController.getDashboardStats);
router.get("/transaction-amount", checkAuth(...Object.values(Role)), StatsController.getTransactionStats);
router.get("/transaction-summary", checkAuth(Role.admin), StatsController.getTransactionSummary);


export const StatsRoutes = router;