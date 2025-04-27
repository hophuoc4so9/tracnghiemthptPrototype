import { TaiKhoan } from "../../models/Taikhoan.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetToken } from "../../utils/generateToken.util.js";
import jwt from "jsonwebtoken";
import { ENV_VARS } from "../../config/envVars.config.js";
export async function signup(req, res) {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        code: 400,
        message: "Tất cả các trường thông tin đều bắt buộc",
      });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ code: 400, message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }
    const existingUserByEmail = await TaiKhoan.findOne({
      email: email,
    });
    const existingUserByUsername = await TaiKhoan.findOne({
      username: username,
    });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ code: 400, message: "Email đã tồn tại trong hệ thống" });
    }
    if (existingUserByUsername) {
      return res
        .status(400)
        .json({ code: 400, message: "Tên người dùng đã tồn tại trong hệ thống" });
    }
    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

     
      // Proceed with normal signup for students
      const newUser = new TaiKhoan({
        username,
        email,
        password: hashedPassword,
        role,
      });
      await newUser.save();
      generateTokenAndSetToken(newUser._id, res); //jwt
      return res
        .status(201)
        .json({ code: 201, message: "Tạo tài khoản người dùng thành công" });
    
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Lỗi máy chủ" });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ code: 400, message: "Email và mật khẩu là bắt buộc" });
    }
    const user = await TaiKhoan.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ code: 400, message: "Không tìm thấy người dùng" });
    }
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ code: 400, message: "Mật khẩu không hợp lệ" });
    }
    generateTokenAndSetToken(user._id, res); //jwt
    res.status(201).json({
      code: 201,
      message: "Đăng nhập thành công",
      user: user,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Lỗi máy chủ",
    });
  }
}
export async function logout(req, res) {
  try {
    res.clearCookie("jwt-token");
    res.status(201).json({ code: 201, message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(400).json({ code: 400, message: "Lỗi máy chủ" });
  }
}
export async function getUserInfo(req, res) {
  try {
    const token = req.cookies["jwt-token"];
    if (!token) {
      return res
        .status(401)
        .json({ code: 401, message: "Bạn chưa đăng nhập" });
    }

    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const user = await TaiKhoan.findById(decoded.userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ code: 200, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
  }
}
