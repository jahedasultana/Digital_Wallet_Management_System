import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { WalletRoutes } from "../modules/wallet/wallet.routes";
import { TransactionRoutes } from "../modules/transaction/transaction.routes";
import { StatRoutes } from "../modules/stats/stats.routes";

export const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/wallet",
    route: WalletRoutes,
  },
  {
    path: "/transaction",
    route: TransactionRoutes,
  },
  {
    path: "/stats",
    route: StatRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
