import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store in memory for Cloudinary upload (no disk storage needed)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).slice(1).toLowerCase();
  const mimetype = file.mimetype.startsWith("image/");

  if (allowed.test(ext) && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed"),
      false
    );
  }
};

const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const allowedExt = /pdf|docx/;
  const ext = path.extname(file.originalname).slice(1).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExt.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for images
  fileFilter,
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for documents
  fileFilter: documentFilter,
});
