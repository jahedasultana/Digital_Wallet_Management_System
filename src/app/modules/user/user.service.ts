import mongoose from "mongoose";
import { IUser, UpdateProfilePayload } from "./user.interface";
import { User } from "./user.model";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "../transaction/transaction.model";
import { Role, UserStatus, verifyStatus } from "../../types";
import bcrypt from "bcrypt";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import {
  deleteImageFromCloudinary,
  uploadBufferToCloudinary,
} from "../../config/cloudinary.config";
import envConfig from "../../config/env";
import { TransactionType } from "../transaction/transaction.constant";
import { QueryBuilder } from "../../utils/QueryBuilders";
import { userSearchableFields } from "../../../constants";
import { INITIAL_BALANCE } from "../wallet/wallet.constant";

const createUser = async (
  payload: Partial<IUser>,
  profileBuffer?: Buffer,
  profileOriginalName?: string,
  identifierBuffer?: Buffer,
  identifierOriginalName?: string
) => {
  if (!payload.identifier) {
    throw new AppError(httpStatus.BAD_REQUEST, "Identifier is required");
  }
  if (!identifierBuffer || !identifierOriginalName) {
    throw new AppError(httpStatus.BAD_REQUEST, "Identifier image is required");
  }
  if (!payload.email || !payload.phone) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email and Phone are required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, phone, password, name, role, identifier } = payload;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
    }

    if (!password) {
      throw new AppError(httpStatus.BAD_REQUEST, "Password is required");
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(envConfig.BCRYPT_SALT_ROUND)
    );

    let profileImageUrl = "";
    if (profileBuffer && profileOriginalName) {
      const profile_image = await uploadBufferToCloudinary(
        profileBuffer,
        profileOriginalName,
        "profile-pictures"
      );
      profileImageUrl = profile_image?.secure_url || "";
    }

    const kycImage = await uploadBufferToCloudinary(
      identifierBuffer,
      identifierOriginalName,
      "kyc"
    );

    const newUser = await User.create(
      [
        {
          name,
          email,
          phone,
          password: hashedPassword,
          role: role || Role.USER,
          status: UserStatus.ACTIVE,
          verified: verifyStatus.PENDING,
          profile_picture: profileImageUrl,
          identifier,
          identifier_image: kycImage.secure_url,
        },
      ],
      { session }
    );

    if (!newUser) {
      await deleteImageFromCloudinary(profileImageUrl);
      await deleteImageFromCloudinary(kycImage.secure_url);
    }

    // Create wallet
    await Wallet.create(
      [
        {
          user: newUser[0]._id,
          balance: INITIAL_BALANCE,
        },
      ],
      { session }
    );

    // Initial transaction
    await Transaction.create(
      [
        {
          type: TransactionType.ADD,
          sender: null,
          receiver: newUser[0]._id,
          amount: INITIAL_BALANCE,
          status: "success",
          notes: "Initial balance on registration",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return newUser[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getUserById = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  return user;
};

const updateProfile = async (
  userId: string,
  payload: UpdateProfilePayload,
  profileBuffer?: Buffer,
  profileOriginalName?: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (payload.name) user.name = payload.name;
  if (payload.phone) user.phone = payload.phone;
  if (payload.password) user.password = payload.password; // pre-save hook should hash

  if (profileBuffer && profileOriginalName) {
    if (user.profile_picture)
      await deleteImageFromCloudinary(user.profile_picture);

    const profileImage = await uploadBufferToCloudinary(
      profileBuffer,
      profileOriginalName,
      "profile-pictures"
    );
    user.profile_picture = profileImage.secure_url;
  }

  return user.save();
};

const deleteUserById = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  return user;
};

const getAllUsers = async (query: Record<string, string>) => {
  const initialQuery = User.find({ role: { $in: [Role.USER, Role.AGENT] } });
  const queryBuilder = new QueryBuilder(initialQuery, query);

  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build(),
    queryBuilder.getMeta(),
  ]);

  return { data, meta };
};

const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  user.status = status;
  return user.save();
};

const approveAgentOrUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (![Role.AGENT, Role.USER].includes(user.role)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user role");
  }

  user.verified = verifyStatus.VERIFIED;
  user.status = UserStatus.ACTIVE;
  return user.save();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateUserById = async (id: string, data: any) => {
  const user = await User.findByIdAndUpdate(id, data, { new: true });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

export const UserServices = {
  createUser,
  updateProfile,
  getUserById,
  updateUserById,
  deleteUserById,
  getAllUsers,
  updateUserStatus,
  approveAgentOrUser,
};
