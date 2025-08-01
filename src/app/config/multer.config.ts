// src/app/config/multer.config.ts

import multer from "multer";

// Use in-memory storage so the file is accessible as a buffer in req.file.buffer
const storage = multer.memoryStorage();

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // optional: 2MB file size limit
  },
});
