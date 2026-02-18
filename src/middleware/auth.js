import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    const error = new Error("Not authorized to access this route");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-__v");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    next();
  } catch (err) {
    const error = new Error("Not authorized to access this route");
    error.statusCode = 401;
    next(error);
  }
};
