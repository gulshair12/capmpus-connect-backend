import express from "express";
import { protect } from "../middleware/auth.js";
import { upload } from "../config/multer.js";
import { uploadProfilePicture } from "../controllers/uploadController.js";

const router = express.Router();

// Single image upload for profile picture (protected)
router.post(
  "/profile-picture",
  protect,
  upload.single("image"),
  uploadProfilePicture
);

export default router;
