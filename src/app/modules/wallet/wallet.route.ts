import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { WalletController } from "./wallet.controller";

const router = Router();

router.get("/", checkAuth(Role.admin), WalletController.getAllWallet);
router.post("/add-money", checkAuth(Role.user), WalletController.addMoney);
router.post("/send", checkAuth(Role.user), WalletController.sendMoney);
router.post("/cash-in", checkAuth(Role.agent), WalletController.cashIn);
router.post("/cash-out", checkAuth(Role.user, Role.agent), WalletController.cashOut);
router.get("/:id", checkAuth(Role.admin), WalletController.getSingleWallet);
router.post("/block/:walletId", checkAuth(Role.admin), WalletController.block);
router.post(
  "/unblock/:walletId",
  checkAuth(Role.admin),
  WalletController.unblock
);

export const WalletRoutes = router;
