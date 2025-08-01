/* eslint-disable no-console */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import envConfig from "../config/env";
import { verifyToken } from "../utils/jwt";
import AppError from "../errorHelpers/AppError";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import { UserStatus } from "../types";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies?.accessToken;

      if (!accessToken) {
        throw new AppError(403, "No Token Received");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envConfig.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExist = await User.findOne({ email: verifiedToken.email });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
      }
      if (!isUserExist.verified) {
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

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route!!!");
      }
      req.user = verifiedToken;
      next();
    } catch (error) {
      console.log("jwt error", error);
      next(error);
    }
  };
