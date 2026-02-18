import User from "../models/User.js";
import { uploadToCloudinary } from "../middleware/uploadToCloudinary.js";

/**
 * Example: upload profile picture and update user.
 * Expects multer single file field "image" and protect middleware (auth).
 */
export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      const error = new Error("No file uploaded");
      error.statusCode = 400;
      throw error;
    }

    const { url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      "campus-connect/avatars"
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: url },
      { new: true }
    ).select("-password -__v");

    res.json({
      success: true,
      message: "Profile picture updated",
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    next(err);
  }
};
