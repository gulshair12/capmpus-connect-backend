import { uploadToCloudinary } from "../utils/cloudinary.js";

/**
 * Upload event image to Cloudinary. Returns URL for use when creating/updating events.
 * Expects multipart field "image" (jpeg, jpg, png, gif, webp). Admin only.
 */
export const uploadEventImage = async (req, res, next) => {
  try {
    const file = req.files?.image?.[0] || req.files?.file?.[0] || req.file;
    if (!file || !file.buffer) {
      const error = new Error("No image uploaded");
      error.statusCode = 400;
      throw error;
    }

    const { url, publicId } = await uploadToCloudinary(
      file.buffer,
      "campus-connect/events"
    );

    res.status(200).json({
      success: true,
      message: "Event image uploaded",
      url,
      publicId,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload resource file (PDF/DOCX) to Cloudinary. Returns URL for use when creating/updating resources.
 * Expects multipart field "file". Admin only.
 */
export const uploadResourceFile = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      const error = new Error("No file uploaded");
      error.statusCode = 400;
      throw error;
    }

    const { url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      "campus-connect/resources",
      { resource_type: "raw", originalFilename: req.file.originalname }
    );

    res.status(200).json({
      success: true,
      message: "Resource file uploaded",
      url,
      publicId,
    });
  } catch (err) {
    next(err);
  }
};
