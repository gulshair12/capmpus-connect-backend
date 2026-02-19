export const getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};
