import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import { UserStatus } from "../../types";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  // Extract buffers and original filenames safely
  const profileBuffer = files?.["profile_picture"]?.[0]?.buffer;
  const profileOriginalName = files?.["profile_picture"]?.[0]?.originalname;

  const identifierBuffer = files?.["identifier_image"]?.[0]?.buffer;
  const identifierOriginalName = files?.["identifier_image"]?.[0]?.originalname;

  //   // Call service to create user
  const user = await UserServices.createUser(
    req.body,
    profileBuffer,
    profileOriginalName,
    identifierBuffer,
    identifierOriginalName
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Created Successfully",
    data: user,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const query = Object.fromEntries(
    Object.entries(req.query).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(",") : String(value),
    ])
  ) as Record<string, string>;
  const result = await UserServices.getAllUsers(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users and agents fetched successfully by admin",
    data: result.data,
    meta: result.meta,
  });
});

const blockUserWallet = catchAsync(async (req, res) => {
  const result = await UserServices.updateUserStatus(
    req.params.id,
    UserStatus.BLOCKED
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User wallet blocked by admin",
    data: result,
  });
});

const unblockUserWallet = catchAsync(async (req, res) => {
  const result = await UserServices.updateUserStatus(
    req.params.id,
    UserStatus.ACTIVE
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User wallet unblocked by admin",
    data: result,
  });
});

const approveAgent = catchAsync(async (req, res) => {
  const result = await UserServices.approveAgentOrUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent/User approved by admin",
    data: result,
  });
});

const suspendAgent = catchAsync(async (req, res) => {
  const result = await UserServices.updateUserStatus(
    req.params.id,
    UserStatus.SUSPENDED
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent suspended by admin",
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  blockUserWallet,
  unblockUserWallet,
  approveAgent,
  suspendAgent,
};
