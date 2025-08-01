/* eslint-disable no-console */
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { IUser } from "../modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import envConfig from "../config/env";
import { User } from "../modules/user/user.model";
import AppError from "../errorHelpers/AppError";
import { UserStatus } from "../types";

// Generate access and refresh tokens
export const createUserTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envConfig.JWT_ACCESS_SECRET,
    envConfig.JWT_ACCESS_EXPIRES
  );

  const refreshToken = generateToken(
    jwtPayload,
    envConfig.JWT_REFRESH_SECRET,
    envConfig.JWT_REFRESH_EXPIRES
  );

  return {
    accessToken,
    refreshToken,
  };
};

// Refresh token logic: issue new access token
export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  let verifiedRefreshToken: JwtPayload;

  try {
    verifiedRefreshToken = verifyToken(
      refreshToken,
      envConfig.JWT_REFRESH_SECRET
    ) as JwtPayload;
  } catch (err) {
    console.error("❌ Invalid refresh token:", err);
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  const user = await User.findOne({ email: verifiedRefreshToken.email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }

  if (
    user.status === UserStatus.BLOCKED ||
    user.status === UserStatus.INACTIVE
  ) {
    throw new AppError(httpStatus.FORBIDDEN, `User is ${user.status}`);
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const newAccessToken = generateToken(
    jwtPayload,
    envConfig.JWT_ACCESS_SECRET,
    envConfig.JWT_ACCESS_EXPIRES
  );

  return newAccessToken;
};
