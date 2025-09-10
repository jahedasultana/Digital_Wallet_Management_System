import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userToken";
import { JwtPayload } from "jsonwebtoken";
import envConfig from "../../config/env";
import { ResetPasswordPayload, UserStatus, verifyStatus } from "../../types";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendMail";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist");
  }

  const isPasswordMatched = await bcrypt.compare(
    password as string,
    isUserExist.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password");
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

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );

  return {
    accessToken: newAccessToken,
  };
};

const resetPassword = async (payload: ResetPasswordPayload) => {
  const { id, token, newPassword } = payload;

  if (!id || !token) {
    throw new AppError(400, "Invalid or missing reset token");
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, envConfig.JWT_ACCESS_SECRET) as JwtPayload;
  } catch (err) {

    throw new AppError(401, `Reset token expired or invalid: ${err}`);
  }

  // ✅ Ensure token userId matches the one in query param
  if (id !== decoded.userId) {
    throw new AppError(401, "You are not allowed to reset this password");
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError(404, "User does not exist");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(envConfig.BCRYPT_SALT_ROUND)
  );

  user.password = hashedPassword;
  await user.save();

  return true;
};

const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  if (isUserExist.verified !== verifyStatus.VERIFIED) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
  }
  if (
    isUserExist.status === UserStatus.BLOCKED ||
    isUserExist.status === UserStatus.INACTIVE ||
    isUserExist.status === UserStatus.SUSPENDED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserExist.status.toLowerCase()}`
    );
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const resetToken = jwt.sign(jwtPayload, envConfig.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${envConfig.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

  sendEmail({
    to: isUserExist.email,
    subject: "Password Reset",
    templateName: "forgotPassword",
    templateData: {
      name: isUserExist.name,
      resetUILink,
    },
  });
};

const setPassword = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const hashedPassword = await bcrypt.hash(
    plainPassword,
    Number(envConfig.BCRYPT_SALT_ROUND)
  );

  user.password = hashedPassword;

  await user.save();
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isOldPasswordMatch = await bcrypt.compare(
    oldPassword,
    user.password as string
  );
  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
  }

  user.password = await bcrypt.hash(
    newPassword,
    Number(envConfig.BCRYPT_SALT_ROUND)
  );

  await user.save();
};
export const AuthServices = {
  credentialsLogin,
  changePassword,
  getNewAccessToken,
  resetPassword,
  forgotPassword,
  setPassword,
};
