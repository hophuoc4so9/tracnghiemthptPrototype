import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars.config.js";
export const generateTokenAndSetToken = (userId, res) => {
  const token = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, {
    expiresIn: "15d",
  });
 
  res.cookie("jwt-token", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: ENV_VARS.NODE_ENV !== "development",
  });
 
  return token;
};

export const verifyToken = (req, res, next) => {
  const token = req.cookies['jwt-token'];  
  
  if (!token) {
    return res.status(403).json({ message: "Token không có sẵn!" });
  }

  // Giải mã token và xác minh
  jwt.verify(token, ENV_VARS.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ!" });
    }
    
    req.userId = decoded.userId;
    next();
  });
};