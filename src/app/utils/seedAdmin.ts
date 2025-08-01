/* eslint-disable no-console */

import bcrypt from "bcrypt";
import { User } from "../modules/user/user.model";
import { Wallet } from "../modules/wallet/wallet.model"; // ✅ import Wallet model
import { Role, UserStatus, IdentifierType, verifyStatus } from "../types";
import envConfig from "../config/env";

export const seedAdmin = async () => {
  try {
    const isAdminExist = await User.findOne({
      email: envConfig.ADMIN_EMAIL,
    });

    if (isAdminExist) {
      console.log("Admin Already Exists!");
      return;
    }

    console.log("Trying to create Admin...");

    if (!envConfig.ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_PASSWORD is not defined in environment variables."
      );
    }

    const hashedPassword = await bcrypt.hash(
      envConfig.ADMIN_PASSWORD,
      Number(envConfig.BCRYPT_SALT_ROUND)
    );

    const payload = {
      name: "Admin",
      email: envConfig.ADMIN_EMAIL,
      phone: envConfig.ADMIN_PHONE,
      password: hashedPassword,
      profile_picture: "https://dummyimage.com/600x400/000/fff",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      verified: verifyStatus.VERIFIED,
      identifier: IdentifierType.NID,
      identifier_image: "https://dummyimage.com/600x400/000/fff",
    };

    const superAdmin = await User.create(payload);

    // ✅ Create Wallet for Admin
    await Wallet.create({
      user: superAdmin._id,
      balance: 50, // or set a custom admin starting balance
      status: "ACTIVE",
    });

    console.log("✅ Admin & Wallet Created Successfully!\n");
    console.log(superAdmin);
  } catch (error) {
    console.error("❌ Failed to create Admin:", error);
  }
};
