import { Types } from "mongoose";
import { User } from "../modules/user/user.model";

export const pushTransactionToUser = async (
  userId: Types.ObjectId,
  transactionId: Types.ObjectId,
  session: any
) => {
  return User.findByIdAndUpdate(
    userId,
    { $push: { transactionId } },
    { runValidators: true, session }
  );
};
