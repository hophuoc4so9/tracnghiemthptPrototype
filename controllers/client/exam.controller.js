import Exam from "../../models/Exam.model.js";
import Result from "../../models/Result.model.js";
import { Passage } from "../../models/Passage.model.js";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const index = async (req, res) => {
  try {
    //pagination
    let currentPage = 1;
    if (req.query.page) {
      currentPage = parseInt(req.query.page);
    }
    let limitItems = 4;
    if (req.query.limit) {
      limitItems = parseInt(req.query.limit);
    }
    // const cacheExam = await redisService.get(
    //   `CACHE_EXAM_PAGE_${currentPage}_LIMIT_${limitItems}`
    // );
    // if (cacheExam) {
    //   return res.status(200).json(cacheExam);
    // }
    const condition = {
      isPublic: true,
    };
    const totalItems = await Exam.countDocuments({ isPublic: true });

    const skip = (currentPage - 1) * limitItems;
    const totalPage = Math.ceil(totalItems / limitItems);
    const exams = await Exam.find(condition)
      .populate("questions")
      .populate("listeningExams") // Add this line
      .limit(limitItems)
      .skip(skip);
    const data = {
      code: 200,
      exams,
      currentPage: currentPage,
      totalItems: totalItems,
      totalPage: totalPage,
      limitItems: limitItems,
      hasNextPage: currentPage < totalPage,
    };
    // await redisService.set(
    //   `CACHE_EXAM_PAGE_${currentPage}_LIMIT_${limitItems}`,
    //   data
    // );
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message });
  }
};

export const detailExam = async (req, res) => {
  try {
    const { slug } = req.params;
    // const cacheDetailExam = await redisService.get(
    //   `CACHE_DETAIL_EXAMPLE_${slug}`
    // );
    // if (cacheDetailExam) {
    //   return res.status(200).json(cacheDetailExam);
    // }
    const exam = await Exam.findOne({ slug })
      .populate("questions")
      .populate("listeningExams"); // Add this line
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    // await redisService.set(`CACHE_DETAIL_EXAMPLE_${slug}`, { code: 200, exam });
    res.status(200).json({ code: 200, exam });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message });
  }
};

export const joinedExam = async (req, res) => {
  try {
    // Kiểm tra xem người dùng có đang tham gia Đề Thi khác không
    // const ongoingExam = await Result.findOne({
    //   userId: req.user._id,
    //   isCompleted: false,
    //   endTime: { $gt: new Date() },
    // });
    // if (ongoingExam) {
    //   return res.status(400).json({
    //     code: 400,
    //     message: "Bạn đang tham gia Đề Thi khác.",
    //   });
    // }

    // Tìm đề thi và populate các câu hỏi của đề chính và phần nghe
    const exam = await Exam.findOne({ _id: req.params.examId })
      .populate({
        path: "questions",
        populate: { path: "answers" },
      })


    if (!exam) {
      return res.status(404).json({ message: "Đề thi không tồn tại." });
    }

    // 1. Shuffle toàn bộ câu hỏi và shuffle cả câu trả lời trong mỗi câu hỏi
    const allShuffled = shuffleArray(exam.questions).map((question) => {
      return {
        ...question.toObject(),
        answers: shuffleArray(question.answers),
      };
    });

    // 2. Tách riêng câu hỏi đọc (có passageId) và câu hỏi riêng lẻ (không có passageId)
    const groupedQuestions = {};
    const shuffledQuestions = []; // chứa câu hỏi không có passageId (câu hỏi riêng lẻ)

    for (const question of allShuffled) {
      if (question.passageId) {
        if (!groupedQuestions[question.passageId]) {
          groupedQuestions[question.passageId] = [];
        }
        groupedQuestions[question.passageId].push(question);
      } else {
        shuffledQuestions.push(question);
      }
    }

    // 3. Lấy các passage tương ứng theo passageId
    const passageIds = Object.keys(groupedQuestions);
    const passages = await Promise.all(
      passageIds.map((id) => Passage.findById(id))
    );

    // 4. Tạo mảng readingQuestionsArray chứa: { passageInfo, questions }
    const readingQuestionsArray = passageIds.map((id) => {
      return {
        passageInfo: passages.find((p) => p._id.toString() === id),
        questions: groupedQuestions[id],
      };
    });

    // Đảo thứ tự bài nghe và câu hỏi của từng bài nghe
    const shuffledListeningExams = exam.listeningExams.map((listeningExam) => {
      return {
        ...listeningExam.toObject(),
        questions: shuffleArray(listeningExam.questions).map(
          (listeningQuestion) => ({
            ...listeningQuestion.toObject(),
            options: shuffleArray(listeningQuestion.options),
          })
        ),
      };
    });

    // Tạo kết quả mới với thời gian kết thúc dựa trên thời lượng của đề thi
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + exam.duration);

    const result = new Result({
      examId: exam._id,
      userId: req.user._id,
      score: 0,
      correctAnswer: 0,
      wrongAnswer: 0,
      isCompleted: false,
      endTime,
    });

    await result.save();

    res.status(200).json({
      code: 200,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      questions: shuffledQuestions,
      listeningExams: shuffledListeningExams,
      readingQuestion: readingQuestionsArray,
      resultId: result._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi khi tham gia đề thi." });
  }
};
