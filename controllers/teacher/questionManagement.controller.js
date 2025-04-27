import { Question } from "../../models/Question.model.js";
import { QuestionType } from "../../models/QuestionType.model.js";
import { Passage } from "../../models/Passage.model.js";


export const questionManagement = async (req, res) => {
  // //questionType
  const questionTypes = await QuestionType.find({ deleted: false });
  const receivedQuestionTypes = req.query.questionType || { $exists: true };
  //pagination
  let currentPage = 1;
  if (req.query.page) {
    currentPage = parseInt(req.query.page);
  }
  const condition = {
    questionType: receivedQuestionTypes,
    deleted: false,
  };
  const totalItems = await Question.countDocuments(condition);
  let limitItems = 4;
  if (req.query.limit) {
    limitItems = parseInt(req.query.limit);
  }
  const skip = (currentPage - 1) * limitItems;
  const totalPage = Math.ceil(totalItems / limitItems);
  const questions = await Question.find(condition)
    .limit(limitItems)
    .skip(skip)
    .populate("passageId"); // Populate the passageId field with the corresponding Passage document

  const questionsWithDetails = await Promise.all(
    questions.map(async (element) => {
      element = element.toObject();

    

      // Include passage info if passageId exists
      // if (element.passageId) {
      //   const passage = await Passage.findById(element.passageId);
      //   element.passage = passage;
      // }

      return element;
    })
  );

  res.status(200).json({
    code: 200,
    message: "Lấy danh sách câu hỏi thành công!",
    questions: questionsWithDetails,
    questionTypes: questionTypes,
    currentPage: currentPage,
    totalItems: totalItems,
    totalPage: totalPage,
    limitItems: limitItems,
    hasNextPage: currentPage < totalPage,
  });
};

export const detail = async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return res.status(400).json({
      code: 400,
      message: "Không tìm thấy câu hỏi",
    });
  }

  let passage = null;
  if (question.passage) {
    passage = await Passage.findById(question.passageId); 
  }

  res.status(200).json({
    code: 200,
    message: "Lấy chi tiết câu hỏi thành công",
    question: question,
    passage: passage, // Bao gồm nội dung đoạn văn
  });
};

export const update = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(400).json({
        code: 400,
        message: "Không tìm thấy câu hỏi",
      });
    }
    res.status(200).json({
      code: 200,
      message: "Lấy chi tiết câu hỏi thành công",
      question: question,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Lỗi máy chủ nội bộ" });
  }
};

export const createPost = async (req, res) => {
  try {
    const newQuestion = new Question(req.body);

    await newQuestion.save();
    res.status(200).json({
      code: 200,
      message: "Tạo câu hỏi mới thành công",
      id: newQuestion._id,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Lỗi máy chủ nội bộ" });
  }
};


export const updatePatch = async (req, res) => {
  try {
    const updateData = { ...req.body };


    await Question.updateOne(
      {
        _id: req.params.id,
      },
      updateData
    );

    res.status(200).json({
      code: 200,
      message: "Cập nhật câu hỏi thành công",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Lỗi máy chủ nội bộ" });
  }
};
