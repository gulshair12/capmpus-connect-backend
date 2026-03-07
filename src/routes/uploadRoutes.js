import express from "express";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { upload, uploadDocument } from "../config/multer.js";
import {
  uploadEventImage,
  uploadResourceFile,
} from "../controllers/uploadController.js";

const router = express.Router();

// Event image upload (admin only) - accepts field "image" or "file"
router.post(
  "/event-image",
  protect,
  adminOnly,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]),
  uploadEventImage
);

// Resource file upload (admin only) - multipart field "file" (PDF/DOCX)
router.post(
  "/resource-file",
  protect,
  adminOnly,
  uploadDocument.single("file"),
  uploadResourceFile
);

export default router;
