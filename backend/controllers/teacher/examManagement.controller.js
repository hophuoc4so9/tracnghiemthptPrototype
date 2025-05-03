import Exam from "../../models/Exam.model.js";
import { Question } from "../../models/Question.model.js";
import mongoose from "mongoose";



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

// [PATCH]: teacher/exam/toggle-visibility/:id
export const toggleExamVisibility = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL

    // Tìm đề thi theo id
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Chuyển đổi trạng thái công khai
    exam.isPublic = !exam.isPublic;

    // Lưu thay đổi
    await exam.save();

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: `Đề thi đã được ${
        exam.isPublic ? "công khai" : "ẩn"
      } thành công!`,
      data: {
        id: exam._id,
        title: exam.title,
        isPublic: exam.isPublic,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Lỗi server! Không thể cập nhật trạng thái công khai của đề thi.",
      error: error.message,
    });
  }
};

// [POST]: teacher/exam/create
export const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      questions,
      duration,
      isPublic,
      startTime,
      endTime,
      listeningExams,
      class: examClass, // Add this line
      topic, // Add this line
      knowledge, // Add this line
    } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc! Vui lòng kiểm tra lại.",
      });
    }

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!",
      });
    }

    // Tạo đối tượng Exam mới
    const newExam = new Exam({
      title,
      description,
      questions,
      duration: duration || 90, // Sử dụng giá trị mặc định nếu không có
      isPublic: isPublic || false,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      createdBy: req.user._id,
      listeningExams,
      class: examClass, // Add this line
      topic: topic || [], // Add this line
      knowledge: knowledge || [], // Add this line
    });

    // Lưu vào database
    const savedExam = await newExam.save();

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Đề thi đã được tạo thành công!",
      data: savedExam,
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Error creating exam:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể tạo đề thi.",
      error: error.message,
    });
  }
};

// [PATCH]: teacher/exam/update/:slug
export const updateExam = async (req, res) => {
  try {
    const { slug } = req.params; // Lấy slug từ URL
    const {
      title,
      description,
      questions,
      duration,
      isPublic,
      startTime,
      endTime,
      listeningExams,
      class: examClass, // Add this line
      topic, // Add this line
      knowledge, // Add this line
    } = req.body;

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!",
      });
    }

    // Cập nhật đề thi dựa trên slug
    const updatedExam = await Exam.findOneAndUpdate(
      { slug },
      {
        title,
        description,
        questions,
        duration,
        isPublic,
        startTime,
        endTime,
        listeningExams,
        class: examClass, // Add this line
        topic: topic || [], // Add this line
        knowledge: knowledge || [], // Add this line
      },
      { new: true, runValidators: true } // Trả về tài liệu sau khi cập nhật
    );

    // Nếu không tìm thấy đề thi, trả về lỗi 404
    if (!updatedExam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Đề thi đã được cập nhật thành công!",
      data: updatedExam,
    });
  } catch (error) {
    // Xử lý lỗi server
    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể cập nhật đề thi.",
      error: error.message,
    });
  }
};

// [DELETE]: teacher/exam/delete/:id
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL

    // Tìm và xóa đề thi dựa trên _id
    const deletedExam = await Exam.findByIdAndDelete(id);

    // Nếu không tìm thấy đề thi, trả về lỗi 404
    if (!deletedExam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Đề thi đã được xóa thành công!",
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Lỗi khi xóa đề thi:", error.message);

    // Trả về lỗi 500 cho client
    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể xóa đề thi.",
      error: error.message,
    });
  }
};

// [PATCH]: teacher/exam/schedule/:id
export const setExamSchedule = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID của đề thi từ URL
    const { startTime, endTime } = req.body; // Lấy thời gian từ request body

    // Kiểm tra dữ liệu đầu vào
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin thời gian! Cần có cả startTime và endTime.",
      });
    }

    // Kiểm tra logic thời gian
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!",
      });
    }

    // Tìm và cập nhật thời gian của đề thi
    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
      { new: true, runValidators: true } // Trả về tài liệu sau khi cập nhật và kiểm tra ràng buộc
    );

    // Nếu không tìm thấy đề thi, trả về lỗi 404
    if (!updatedExam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Lịch thi đã được cập nhật thành công!",
      data: updatedExam,
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Error setting exam schedule:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể đặt lịch thi.",
      error: error.message,
    });
  }
};
//[POST ]
export const autoGenerateExam = async (req, res) => {
  try {
    const { level, numberOfQuestions, duration, questionTypes } = req.body;

    if (
      !questionTypes ||
      !Array.isArray(questionTypes) ||
      questionTypes.length === 0
    ) {
      return res.status(400).json({
        code: 400,
        message: "Yêu cầu nhập loại câu hỏi ! ",
      });
    }

    let easyCount = 0,
      mediumCount = 0,
      hardCount = 0;

    if (level === "easy") {
      easyCount = numberOfQuestions;
    } else if (level === "medium") {
      mediumCount = Math.ceil(numberOfQuestions / 2);
      easyCount = numberOfQuestions - mediumCount;
    } else if (level === "hard") {
      hardCount = numberOfQuestions;
    } else {
      return res.status(400).json({
        code: 400,
        message: "Cấp độ phải là Easy, Medium hoặc Hard!",
      });
    }

    const selectedIds = new Set();
    let questions = [];

    const getQuestions = async (level, count) => {
      const results = await Question.aggregate([
        {
          $match: {
            level,
            questionType: {
              $in: questionTypes.map((id) => new mongoose.Types.ObjectId(id)),
            },
            _id: { $nin: [...selectedIds] },
          },
        },
        { $sample: { size: count } },
      ]);
      results.forEach((q) => selectedIds.add(q._id.toString()));
      return results;
    };

    const fillMissingQuestions = async (missingCount, preferredLevels) => {
      let added = [];
      for (let lvl of preferredLevels) {
        if (added.length >= missingCount) break;
        const more = await getQuestions(lvl, missingCount - added.length);
        added.push(...more);
      }
      return added;
    };

    // Lấy câu hỏi ban đầu theo từng mức độ
    let hardQuestions = await getQuestions("hard", hardCount);
    let mediumQuestions = await getQuestions("medium", mediumCount);
    let easyQuestions = await getQuestions("easy", easyCount);

    const missing = {
      hard: hardCount - hardQuestions.length,
      medium: mediumCount - mediumQuestions.length,
      easy: easyCount - easyQuestions.length,
    };

    // Bù thiếu theo chiến lược linh hoạt
    if (missing.hard > 0) {
      const filled = await fillMissingQuestions(missing.hard, [
        "medium",
        "easy",
      ]);
      hardQuestions.push(...filled);
    }
    if (missing.medium > 0) {
      const filled = await fillMissingQuestions(missing.medium, [
        "easy",
        "hard",
      ]);
      mediumQuestions.push(...filled);
    }
    if (missing.easy > 0) {
      const filled = await fillMissingQuestions(missing.easy, [
        "medium",
        "hard",
      ]);
      easyQuestions.push(...filled);
    }

    // Gộp lại
    questions = [...hardQuestions, ...mediumQuestions, ...easyQuestions];

    // Nếu vẫn thiếu => bù bất kỳ
    const stillNeed = numberOfQuestions - questions.length;
    if (stillNeed > 0) {
      const filler = await fillMissingQuestions(stillNeed, [
        "easy",
        "medium",
        "hard",
      ]);
      questions.push(...filler);
    }

    if (questions.length < numberOfQuestions) {
      return res.status(400).json({
        code: 400,
        message: "Không đủ câu hỏi theo yêu cầu !",
        detail: {
          required: numberOfQuestions,
          found: questions.length,
          missing: {
            hard: Math.max(0, hardCount - hardQuestions.length),
            medium: Math.max(0, mediumCount - mediumQuestions.length),
            easy: Math.max(0, easyCount - easyQuestions.length),
          },
        },
      });
    }

    // Shuffle
    questions.sort(() => Math.random() - 0.5);

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExam = new Exam({
      title: `Đề thi tạo tự động - (${randomCode})`,
      description: `Đề thi được tạo tự động với ${numberOfQuestions} câu hỏi`,
      questions: questions.slice(0, numberOfQuestions).map((q) => q._id),
      duration: duration || 90,
      isPublic: true,
      startTime: new Date(),
      endTime: new Date(Date.now() + (duration || 90) * 60 * 1000),
      createdBy: req.user._id,
    });

    await newExam.save();

    res.status(200).json({
      code: 200,
      message: "Tạo đề thi thành công!",
      exam: newExam,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      code: 500,
      message: "Lỗi server! Không thể tạo đề thi.",
    });
  }
};
