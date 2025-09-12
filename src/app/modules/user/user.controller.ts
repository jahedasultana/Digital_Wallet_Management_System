/* eslint-disable @typescript-eslint/no-unused-vars */
import catchAsync from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { Role } from "./user.interface";
import { AuthService } from "../auth/auth.service";
import { UserService } from "./user.service";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.register(req.body, Role.user);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  }
);

const getAllUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.getAllUser(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Users retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getSingleUserOrAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.getSingleUserOrAgent(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${result?.role} retrieved successfully`,
      data: result,
    });
  }
);

export const UserController = {
  registerUser,
  getAllUser,
  getSingleUserOrAgent
};
