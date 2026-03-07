/**
 * Restrict access to admin only. Must be used after protect middleware.
 */
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden - admin only",
    });
  }
  next();
};
