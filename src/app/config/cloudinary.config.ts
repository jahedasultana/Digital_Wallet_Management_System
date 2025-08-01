/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import stream from "stream";
import AppError from "../errorHelpers/AppError";
import envConfig from "./env";

// Cloudinary config
cloudinary.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  api_key: envConfig.CLOUDINARY_API_KEY,
  api_secret: envConfig.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a buffer to Cloudinary in a specified folder.
 * @param buffer - File buffer
 * @param fileName - Original file name
 * @param folder - Folder name (e.g., "profile-pictures" | "kyc")
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  fileName: string,
  folder: "profile-pictures" | "kyc"
): Promise<UploadApiResponse> => {
  try {
    const sanitizedName = fileName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\.[^/.]+$/, "") // remove extension
      // eslint-disable-next-line no-useless-escape
      .replace(/[^a-z0-9\-]/g, "");

    const uniqueId = `${sanitizedName}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}`;
    const public_id = `${folder}/${uniqueId}`;

    return new Promise((resolve, reject) => {
      const passthrough = new stream.PassThrough();
      passthrough.end(buffer);

      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            public_id,
            overwrite: true,
          },
          (error, result) => {
            if (error || !result)
              return reject(
                new AppError(500, "Cloudinary upload failed", error?.message)
              );
            resolve(result);
          }
        )
        .end(buffer);
    });
  } catch (error: any) {
    throw new AppError(500, `Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Deletes a Cloudinary image by its full URL.
 * Extracts the `public_id` from URL.
 * @param url - Full Cloudinary image URL
 */
export const deleteImageFromCloudinary = async (url: string) => {
  try {
    // Matches folder and public_id (e.g., profile-pictures/abc-123)
    const match = url.match(/\/(?:image\/upload\/)(?:v\d+\/)?(.+?)(?:\.\w+)?$/);

    if (match && match[1]) {
      const public_id = match[1];
      await cloudinary.uploader.destroy(public_id);
      console.log(`✅ Cloudinary image deleted: ${public_id}`);
    } else {
      throw new Error("Invalid Cloudinary URL format.");
    }
  } catch (error: any) {
    throw new AppError(500, "Cloudinary image deletion failed", error.message);
  }
};

// Export configured Cloudinary instance
export const cloudinaryUpload = cloudinary;
