import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars.config.js";
import { TaiKhoan } from "../models/Taikhoan.model.js";
export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies["jwt-token"];
    if (!token) {
      return res.status(400).json({
        code: 400,
        message: "Unauthorized-No token provided. Please Login.",
      });
    }
    const decoded = await jwt.verify(token, ENV_VARS.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Unauthorized-Invalid token !",
      });
    }
    const user = await TaiKhoan.findOne({
      _id: decoded.userId,
    });
    if (!user) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Unauthorized-User not found",
      });
    }
    req.user = user;
    req.role = user.role;
    next();
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: 400,
      message: "Internal server error",
    });
  }
};
// Teacher role middleware
export const isTeacher = (req, res, next) => {
  if (req.role !== "teacher") {
    return res.status(403).json({
      code: 403,
      success: false,
      message: "Access denied. Teachers only.",
    });
  }
  next();
};
// Student role middleware
export const isStudent = (req, res, next) => {
  if (req.role !== "student") {
    return res.status(403).json({
      code: 403,
      success: false,
      message: "Access denied. Students only.",
    });
  }
  next();
};

// Admin role middleware

export const isAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({
      code: 403,
      success: false,
      message: "Access denied. Admins only.",
    });
  }
  next();
};
