import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionController } from "./transaction.controller";

const router = Router();

router.get("/", checkAuth(Role.admin), TransactionController.getAllTransaction);
router.get(
  "/my-transaction",
  checkAuth(...Object.values(Role)),
  TransactionController.getMyTransactionHistory
);
router.get("/:id", checkAuth(...Object.values(Role)), TransactionController.getSingleTransaction);

export const TransactionRoutes = router;
