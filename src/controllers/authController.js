import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      university,
      department,
      graduationYear,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !password ||
      !university ||
      !department ||
      !graduationYear
    ) {
      const error = new Error(
        "Please provide all required fields: fullName, email, password, university, department, graduationYear"
      );
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User with this email already exists");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      university,
      department,
      graduationYear,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        university: user.university,
        department: user.department,
        graduationYear: user.graduationYear,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Please provide email and password");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        university: user.university,
        department: user.department,
        graduationYear: user.graduationYear,
      },
    });
  } catch (err) {
    next(err);
  }
};
