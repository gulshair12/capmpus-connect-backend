import express from "express";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { uploadDocument } from "../config/multer.js";
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} from "../controllers/resource.controller.js";

const router = express.Router();

router.get("/", getResources);
router.get("/:id", getResourceById);

router.post("/", protect, adminOnly, uploadDocument.single("file"), createResource);
router.put("/:id", protect, adminOnly, uploadDocument.single("file"), updateResource);
router.delete("/:id", protect, adminOnly, deleteResource);

export default router;
