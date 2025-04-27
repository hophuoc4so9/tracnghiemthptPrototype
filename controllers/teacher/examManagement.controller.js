import Exam from "../../models/Exam.model.js";

import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);

// [GET]: teacher/exam
// TODO: EXAM CỦA GIÁO VIÊN ĐÓ THÔI, KHÔNG PHẢI TẤT CẢ .
export const getAllExams = async (req, res) => {
  try {
    const { page = 1, limit = 10, title, isPublic } = req.query; // Lấy các tham số từ query

    // Tạo bộ lọc (filter)
    const filter = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" }; // Lọc theo tiêu đề (không phân biệt hoa thường)
    }
    if (isPublic !== undefined) {
      filter.isPublic = isPublic === "true"; // Lọc theo trạng thái công khai
    }

    // Phân trang
    const skip = (page - 1) * limit;

    // Lấy danh sách đề thi dựa trên bộ lọc và phân trang
    const exams = await Exam.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // Sắp xếp giảm dần theo thời gian tạo

    // Đếm tổng số đề thi thỏa mãn bộ lọc
    const total = await Exam.countDocuments(filter);
    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đề thi thành công!",
      data: exams,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Lỗi khi lấy danh sách đề thi:", error.message);

    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể lấy danh sách đề thi.",
      error: error.message,
    });
  }
};

// [GET]: teacher/exam/detail/:slug
export const getExamDetail = async (req, res) => {
  try {
    const { slug } = req.params; // Lấy slug từ URL

    // Tìm đề thi theo slug và populate danh sách câu hỏi và listeningExams
    const exam = await Exam.findOne({ slug })
      .populate({
        path: "questions",
        populate: { path: "passageId", strictPopulate: false }, // Populate passageId for each question
      })
      .populate("listeningExams");

    // Nếu không tìm thấy đề thi, trả về lỗi 404
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Phản hồi thành công với thông tin đề thi
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin đề thi thành công!",
      data: exam,
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Lỗi khi lấy thông tin đề thi:", error.message);

    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể lấy thông tin đề thi.",
      error: error.message,
    });
  }
};

