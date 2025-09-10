import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { StatServices } from "./stats.service";
import { sendResponse } from "../../utils/sendResponse";

// 📊 User Stats
const getUserStats = catchAsync(async (req, res) => {
  const result = await StatServices.getUserStats(req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User stats retrieved successfully",
    data: result,
  });
});

// 📊 Agent Stats
const getAgentStats = catchAsync(async (req, res) => {
  const result = await StatServices.getAgentStats(req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent stats retrieved successfully",
    data: result,
  });
});

// 📊 Admin Stats
const getAdminStats = catchAsync(async (req, res) => {
  const result = await StatServices.getAdminStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin stats retrieved successfully",
    data: result,
  });
});

export const StatController = {
  getUserStats,
  getAgentStats,
  getAdminStats,
};
