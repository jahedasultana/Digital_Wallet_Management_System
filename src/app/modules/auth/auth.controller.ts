/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body);

    setAuthCookie(res, loginInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Login Success",
      data: loginInfo,
    });
  }
);
const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No refresh token received from cookies"
      );
    }
    const tokenInfo = await AuthServices.getNewAccessToken(
      refreshToken as string
    );

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "New Access Token Retrieved Successfully",
      data: tokenInfo,
    });
  }
);
const logout = catchAsync(
  async (_req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Logged Out Successfully",
      data: null,
    });
  }
);
const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;

    await AuthServices.changePassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password Changed Successfully",
      data: null,
    });
  }
);
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;

    await AuthServices.resetPassword(req.body, decodedToken as JwtPayload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password Changed Successfully",
      data: null,
    });
  }
);
const setPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const { password } = req.body;

    await AuthServices.setPassword(decodedToken.userId, password);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password Changed Successfully",
      data: null,
    });
  }
);
const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await AuthServices.forgotPassword(email);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Email Sent Successfully",
      data: null,
    });
  }
);

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  setPassword,
  forgotPassword,
  changePassword,
};
