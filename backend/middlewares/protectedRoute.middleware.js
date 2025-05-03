import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars.config.js";
import { TaiKhoan } from "../models/Taikhoan.model.js";
export const protectedRoute = async (req, res, next) => {
  try {
    // const token = req.cookies["jwt-token"]  ;'
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nzc3NDlkMTQ2OTBjYzAwMDc3ZDUxODYiLCJpYXQiOjE3NDYyNjQ4NDIsImV4cCI6MTc0NzU2MDg0Mn0.rlbp27vafr12TN0ZrVB_oA4nJ0xLoq2Qj-69S7h_Dks';
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
