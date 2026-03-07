import cloudinary from "../config/cloudinary.js";
import crypto from "crypto";

/**
 * Upload a buffer (from multer memory storage) to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Cloudinary folder (e.g. 'campus-connect/events', 'campus-connect/resources')
 * @param {object} options - Optional Cloudinary options. For raw files, pass originalFilename to preserve extension.
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadToCloudinary = (
  buffer,
  folder = "campus-connect",
  options = {},
) => {
  const { originalFilename, fileType, ...restOptions } = options;

  let uploadOptions = { folder, ...restOptions };

  if (restOptions.resource_type === "raw") {
    let ext = "";
    if (originalFilename && originalFilename.includes(".")) {
      ext = originalFilename.slice(originalFilename.lastIndexOf(".")).toLowerCase();
    } else if (fileType === "pdf") {
      ext = ".pdf";
    } else if (fileType === "docx") {
      ext = ".docx";
    }
    const uniqueId = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    uploadOptions.public_id = `${folder}/${uniqueId}${ext}`;
    delete uploadOptions.folder;
  }

  return new Promise((resolve, reject) => {
    const streamOptions = uploadOptions.public_id
      ? uploadOptions
      : { folder, ...restOptions };
    const uploadStream = cloudinary.uploader.upload_stream(
      streamOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete asset from Cloudinary by public_id.
 * @param {string} publicId - Cloudinary public_id
 * @param {string} resourceType - "image" | "raw" | "video" (default: "image")
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  return result;
};
