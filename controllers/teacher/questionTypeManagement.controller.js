import { QuestionType } from "../../models/QuestionType.model.js";

export const index = async (req, res) => {
  try {
    //pagination
    let currentPage = 1;
    if (req.query.page) {
      currentPage = parseInt(req.query.page);
    }
    const condition = {
      deleted: false,
    };
    const totalItems = await QuestionType.countDocuments({ deleted: false });
    const limitItems = 4;
    if (req.query.limit) {
      limitItems = parseInt(req.query.limit);
    }
    const skip = (currentPage - 1) * limitItems;
    const totalPage = Math.ceil(totalItems / limitItems);
    const questionTypes = await QuestionType.find(condition)
      .limit(limitItems)
      .skip(skip);

    res.status(200).json({
      code: 200,
      message: "Lấy danh sách loại câu hỏi thành công!",
      questionTypes: questionTypes,
      currentPage: currentPage,
      totalItems: totalItems,
      totalPage: totalPage,
      limitItems: limitItems,
      hasNextPage: currentPage < totalPage,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Lỗi máy chủ nội bộ!",
    });
  }
};
export const getAllQuestionTypes = async (req, res) => {
  try {
    const questionTypes = await QuestionType.find({ deleted: false });
    res.status(200).json({
      success: true,
      message: "Lấy danh sách tất cả các loại câu hỏi thành công!",
      data: questionTypes,
    });
  } catch (error) {
    console.error("Error fetching question types:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách các loại câu hỏi!",
      error: error.message,
    });
  }
};
