import { ClientSession } from "mongoose";
import { Types } from "mongoose";
import { Wallet } from "../modules/wallet/wallet.model";

export const incrementWalletBalance = (
  walletId: Types.ObjectId,
  amount: number,
  session: ClientSession
) => {
  return Wallet.findByIdAndUpdate(
    walletId,
    { $inc: { balance: amount } },
    { new: true, runValidators: true, session }
  );
};
