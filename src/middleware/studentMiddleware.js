/**
 * Restrict buddy/chat access to students only. Must be used after protect middleware.
 * Admin users are excluded from the buddy system.
 */
export const studentOnly = (req, res, next) => {
  if (req.user.role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Buddy system is for students only",
    });
  }
  next();
};
