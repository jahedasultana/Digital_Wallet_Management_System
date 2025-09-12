import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IUser, Role } from "../user/user.interface";
import { User } from "../user/user.model";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { WalletService } from "../wallet/wallet.service";
import { TransactionService } from "../transaction/transaction.service";
import { Types } from "mongoose";
import { getAdminWallet } from "../../utils/getAdminWallet";
import { incrementWalletBalance } from "../../utils/incrementWalletBalance";
import { IWallet } from "../wallet/wallet.interface";

const register = async (payload: Partial<IUser>, role: Role) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { email, password, phone, ...rest } = payload;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User already Exist!");
    }

    const isPhoneExist = await User.findOne({ phone });
    if (isPhoneExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "Phone number already Exist!");
    }

    const hashedPassword = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const userPayload: Partial<IUser> = {
      email,
      password: hashedPassword,
      phone,
      role,
      ...rest,
    };

    if (role === Role.agent) {
      userPayload.feeRate = Number(envVars.AGENT_FEE_RATE) || 15;
      userPayload.commissionRate = Number(envVars.AGENT_COMMISSION_RATE) || 5;
      userPayload.isApproved = false;
    } else if (role === Role.user) {
      userPayload.feeRate = Number(envVars.USER_FEE_RATE) || 20;
      userPayload.isApproved = true;
    }

    const [user] = await User.create([userPayload], { session });

    const userWallet = await WalletService.createWallet(user._id, session);
    user.walletId = userWallet._id as Types.ObjectId;
    await user.save({ session });

    // let responseData;

    // if (role === Role.agent) {
    //   const agentInfo = user.toObject();
    //   delete agentInfo.password;
    //   responseData = agentInfo;
    // }

    const initialFundingAmount = Number(envVars.USER_INITIAL_FUNDING_AMOUNT);
    const adminWallet = await getAdminWallet(session);

    if (adminWallet.balance < initialFundingAmount) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Admin wallet has insufficient balance"
      );
    }

    const [updatedAdminWallet, updatedUserWallet] = await Promise.all([
      incrementWalletBalance(adminWallet._id, -initialFundingAmount, session),
      incrementWalletBalance(
        userWallet._id as Types.ObjectId,
        initialFundingAmount,
        session
      ),
    ]);

    const updatedUser = await TransactionService.initialFunding(
      updatedAdminWallet as IWallet,
      updatedUserWallet as IWallet,
      initialFundingAmount,
      session
    );

    await session.commitTransaction();
    session.endSession();
    return updatedUser;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User Create Error! ${error.message}`
    );
  }
};

const credentialLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Not Exist!");
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid Password!");
  }

  const userTokens = createUserTokens(isUserExist);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pass, ...rest } = isUserExist.toObject();

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest,
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (
    [Role.admin, Role.agent, Role.user].includes(decodedToken.role as Role) &&
    userId !== decodedToken.userId
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (payload.role) {
    if (decodedToken.userId === userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to update your own role"
      );
    }

    if ([Role.agent, Role.user].includes(decodedToken.role as Role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to change roles"
      );
    }
  }

  const restrictedFields = ["isActive", "isDeleted", "isVerified"];
  if (
    restrictedFields.some((field) => field in payload) &&
    [Role.user, Role.agent].includes(decodedToken.role as Role)
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update these fields"
    );
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

const getMe = async (userId: string) => {
  const myInfo = await User.findById(userId)
    .select("-password")
    .populate("walletId", "balance status")
  return myInfo;
};

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  decodedToken: JwtPayload,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user!.password as string
  );

  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password dose not match");
  }

  if (oldPassword === newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password cannot be the same as old password"
    );
  }

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  user!.save();
};

export const AuthService = {
  register,
  credentialLogin,
  updateUser,
  getMe,
  getNewAccessToken,
  changePassword,
};
