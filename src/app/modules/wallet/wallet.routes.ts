import { Router } from "express";
import { checkAuth } from "../../middlewares/authCheck";
import { Role } from "../../types";
import { WalletController } from "./wallet.controller";

const router = Router();
router.get(
  "/me",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.viewMyWallet
);

router.patch("/top-up", checkAuth(Role.USER), WalletController.topUpWallet);

router.patch(
  "/withdraw",
  checkAuth(Role.USER),
  WalletController.withdrawFromWallet
);

router.patch("/send", checkAuth(Role.USER), WalletController.sendMoney);

router.get("/", checkAuth(Role.ADMIN), WalletController.viewAllWallets);
export const WalletRoutes = router;
