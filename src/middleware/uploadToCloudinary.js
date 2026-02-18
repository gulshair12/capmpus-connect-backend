import cloudinary from "../config/cloudinary.js";

/**
 * Upload a buffer (from multer memory storage) to Cloudinary.
 * Use in controller after multer: req.file.buffer
 *
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Cloudinary folder (e.g. 'campus-connect/avatars')
 * @param {object} options - Optional Cloudinary options
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadToCloudinary = async (
  buffer,
  folder = "campus-connect",
  options = {}
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete asset from Cloudinary by public_id.
 * @param {string} publicId - Cloudinary public_id
 */
export const deleteFromCloudinary = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};
