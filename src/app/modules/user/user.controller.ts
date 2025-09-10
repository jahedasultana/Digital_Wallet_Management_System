import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import { UserStatus } from "../../types";

// Create user
const createUser = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  const profileBuffer = files?.["profile_picture"]?.[0]?.buffer;
  const profileOriginalName = files?.["profile_picture"]?.[0]?.originalname;

  const identifierBuffer = files?.["identifier_image"]?.[0]?.buffer;
  const identifierOriginalName = files?.["identifier_image"]?.[0]?.originalname;

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
    message: "User created successfully",
    data: user,
  });
});

// Get all users (Admin only)
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
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

// View own profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const user = await UserServices.getUserById(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: user,
  });
});

// Update own profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const payload = req.body;

  const file = req.file;
  const profileBuffer = file?.buffer;
  const profileOriginalName = file?.originalname;

  const updatedUser = await UserServices.updateProfile(
    userId,
    payload,
    profileBuffer,
    profileOriginalName
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

// Block user wallet
const blockUserWallet = catchAsync(async (req: Request, res: Response) => {
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

// Unblock user wallet
const unblockUserWallet = catchAsync(async (req: Request, res: Response) => {
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

// Approve agent
const approveAgent = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.approveAgentOrUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent/User approved by admin",
    data: result,
  });
});

// Suspend agent
const suspendAgent = catchAsync(async (req: Request, res: Response) => {
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

// Get individual user info (Admin only)
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

// Update individual user info (Admin only)
const updateUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await UserServices.updateUserById(id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

// Delete user (Admin only)
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.deleteUserById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  getMyProfile,
  updateProfile,
  blockUserWallet,
  unblockUserWallet,
  approveAgent,
  suspendAgent,
  deleteUser,
};
