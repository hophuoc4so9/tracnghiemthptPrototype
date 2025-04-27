import Result from "../../models/Result.model.js";
import { Question } from "../../models/Question.model.js";


// [GET]: /result/
// Lấy tất cả kết quả (không bị xóa và đã hoàn thành) và populate các trường liên quan
export const getAllResults = async (req, res) => {
  try {
    const filter = {
      userId: req.user._id, // Lọc theo userId từ token
      isDeleted: false,
      isCompleted: true,
    };
    // console.log(filter);
    const results = await Result.find(filter).populate({
      path: "examId",
      populate: [
        { path: "questions" },
        {
          path: "listeningExams",
          populate: {
            path: "questions",
            select: "questionText options correctAnswer blankAnswer audio", // Include necessary fields
          },
        },
      ],
    });
    res.status(200).json({
      code: 200,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results", error });
  }
};


// [POST]: /result/submit
// Xử lý nộp bài thi: kiểm tra thời gian, tính điểm, cập nhật kết quả và trả về phản hồi
// Map database type names to switch-case labels
const questionTypeMapping = {
  "Multiple Choices":      "Multiple Choices",
  "Fill in the blank":     "Fill in the Blanks",
  "True/False/Not Given":  "True/False/Not Given",
};

export const submitExam = async (req, res) => {
  try {
    const { resultId, answers = [], listeningAnswers = [], unansweredQuestions = [] } = req.body;
    if (!resultId || !Array.isArray(answers) || !Array.isArray(listeningAnswers)) {
      return res.status(400).json({ message: "Invalid input data." });
    }

    // Fetch ongoing exam result
    const existingResult = await Result.findOne({ _id: resultId, isCompleted: false })
      .populate({
        path: "examId",
        populate: [
          { path: "questions", populate: { path: "questionType", select: "name" } },
          { path: "listeningExams", populate: { path: "questions", populate: { path: "questionType", select: "name" } } }
        ]
      });

    if (!existingResult) {
      return res.status(400).json({ code: 400, message: "No ongoing exam found for this user." });
    }
    const exam = existingResult.examId;
    if (!exam) {
      return res.status(400).json({ code: 400, message: "Exam not found." });
    }

    // If time expired, finalize existing answers
    if (new Date() > existingResult.endTime) {
      let score = 0, correctAnswer = 0, wrongAnswer = 0;
      existingResult.questions?.forEach(q => q.isCorrect ? (score++, correctAnswer++) : wrongAnswer++);
      existingResult.listeningQuestions?.forEach(q => q.isCorrect ? (score++, correctAnswer++) : wrongAnswer++);
      Object.assign(existingResult, { score, correctAnswer, wrongAnswer, isCompleted: true, endTime: new Date() });
      await existingResult.save();
      return res.status(400).json({ code: 400, message: "Exam time has expired. Final score computed.", result: existingResult });
    }

    // Initialize scoring and details
    let score = 0, correctAnswer = 0, wrongAnswer = 0;
    let unAnswerQ = unansweredQuestions.length;
    const questionDetails = [];
    const listeningQuestionDetails = [];
    const wrongAnswerByKnowledge = {};
    const incorrectAnswer = [];
    let answerDetail = "";

    // Handle unanswered questions
    for (const qId of unansweredQuestions) {
      const question = exam.questions.find(q => String(q._id) === String(qId))
        || exam.listeningExams.flatMap(le => le.questions).find(q => String(q._id) === String(qId));
      if (!question) {
        return res.status(400).json({ code: 400, message: `Question ${qId} not found.` });
      }
      wrongAnswer++;
      const know = question.knowledge;
      wrongAnswerByKnowledge[know] = (wrongAnswerByKnowledge[know] || 0) + 1;
      questionDetails.push({
        questionId: question._id,
        content: question.content || question.questionText || "",
        answers: question.answers || question.options,
        userAnswers: [],
        correctAnswerForBlank: question.answers?.map(a => a.correctAnswerForBlank) || [],
        audio: question.audio || null,
        isCorrect: false
      });
      incorrectAnswer.push({
        questionContent: question.content || question.questionText,
        answerDetail: (question.answers || question.options).map(a => a.text || a.correctAnswerForBlank || a.optionText).join("\n"),
        knowledge: know
      });
    }

    // Process standard answers
    for (const ans of answers) {
      const { questionId, selectedAnswerId, userAnswer } = ans;
      const question = exam.questions.find(q => String(q._id) === String(questionId))
        || exam.listeningExams.flatMap(le => le.questions).find(q => String(q._id) === String(questionId));
      if (!question) {
        return res.status(400).json({ code: 400, message: `Question ${questionId} not found.` });
      }
      const typeName = questionTypeMapping[question.questionType.name] || question.questionType.name;
      let isCorrect = false;
      let detail = {};

      switch (typeName) {
        case "Fill in the Blanks": {
          const blanks = question.answers.map(a => a.correctAnswerForBlank.trim().toLowerCase());
          const userDetails = (userAnswer || []).map((ua, i) => {
            const ansClean = ua?.trim().toLowerCase() || "";
            const correct = blanks[i] || "";
            const ok = ansClean === correct;
            return { userAnswer: ua, answerId: question.answers[i]?._id, isCorrect: ok };
          });
          isCorrect = userDetails.length === blanks.length && userDetails.every(d => d.isCorrect);
          detail = { questionId: question._id, content: question.content || "", answers: question.answers, userAnswers: userDetails, correctAnswerForBlank: blanks, audio: question.audio, isCorrect };
          break;
        }
        case "Multiple Choices": {
          const correctObj = question.answers.find(a => a.isCorrect);
          if (!correctObj) return res.status(500).json({ message: `Question ${questionId} has no correct answer.` });
          isCorrect = String(correctObj._id) === String(selectedAnswerId);
          detail = { questionId: question._id, content: question.content || "", answers: question.answers, selectedAnswerId, userAnswers: [{ userAnswer: selectedAnswerId }], correctAnswerForBlank: null, audio: question.audio, isCorrect };
          break;
        }
        case "True/False/Not Given": {
          const correctTF = question.correctAnswerForTrueFalseNGV || [];
          const userTF = (userAnswer || []).map(ua => ({ userAnswer: ua, isCorrect: correctTF.includes(ua.trim().toLowerCase()) }));
          isCorrect = userTF.length === correctTF.length && userTF.every(d => d.isCorrect);
          detail = { questionId: question._id, content: question.content || "", answers: [], userAnswers: userTF, correctAnswerForBlank: correctTF, audio: question.audio, isCorrect };
          break;
        }
        default:
          return res.status(400).json({ message: `Unsupported question type: ${question.questionType.name}` });
      }

      if (isCorrect) { correctAnswer++; score++; } else {
        wrongAnswer++;
        const know = question.knowledge;
        wrongAnswerByKnowledge[know] = (wrongAnswerByKnowledge[know] || 0) + 1;
        answerDetail += (question.answers || []).map(a => a.text || a.correctAnswerForBlank).join("\n") + "\n";
        incorrectAnswer.push({ questionContent: question.content, answerDetail, knowledge: know });
      }
      questionDetails.push(detail);
    }

    // Process listening answers
    for (const ans of listeningAnswers) {
      const { questionId, selectedAnswerId, userAnswer } = ans;
      const question = exam.listeningExams.flatMap(le => le.questions).find(q => String(q._id) === String(questionId));
      if (!question) {
        return res.status(400).json({ code: 400, message: `Listening Question ${questionId} not found.` });
      }
      const typeName = questionTypeMapping[question.questionType.name] || question.questionType.name;
      let isCorrect = false;
      let detail = {};

      switch (typeName) {
        case "Fill in the Blanks": {
          const blanks = question.blankAnswer.split(",").map(a => a.trim().toLowerCase());
          const userDetails = (userAnswer || []).map((ua, i) => ({ userAnswer: ua, answerId: null, isCorrect: ua.trim().toLowerCase() === blanks[i] }));
          isCorrect = userDetails.length === blanks.length && userDetails.every(d => d.isCorrect);
          detail = { questionId: question._id, content: question.questionText || "", answers: question.options || [], userAnswers: userDetails, correctAnswerForBlank: blanks, audio: question.audio, isCorrect };
          break;
        }
        case "Multiple Choices": {
          const correctObj = question.correctAnswer[0];
          if (!correctObj) return res.status(500).json({ message: `Listening Question ${questionId} has no correct answer.` });
          const transformed = (question.options || []).map(opt => ({ ...opt.toObject(), isCorrect: String(opt.option_id) === String(correctObj.answer_id) }));
          isCorrect = String(correctObj.answer_id) === String(selectedAnswerId);
          detail = { questionId: question._id, content: question.questionText || "", answers: transformed, selectedAnswerId, userAnswers: [{ userAnswer: selectedAnswerId }], correctAnswerForBlank: null, audio: question.audio, isCorrect };
          break;
        }
        case "True/False/Not Given": {
          const correctTF = question.correctAnswerForTrueFalseNGV || [];
          const userTF = (userAnswer || []).map(ua => ({ userAnswer: ua, isCorrect: correctTF.includes(ua.trim().toLowerCase()) }));
          isCorrect = userTF.length === correctTF.length && userTF.every(d => d.isCorrect);
          detail = { questionId: question._id, content: question.questionText || "", answers: [], userAnswers: userTF, correctAnswerForBlank: correctTF, audio: question.audio, isCorrect };
          break;
        }
        default:
          return res.status(400).json({ message: `Unsupported question type: ${question.questionType.name}` });
      }

      if (isCorrect) { correctAnswer++; score++; } else {
        wrongAnswer++;
        const know = question.knowledge;
        wrongAnswerByKnowledge[know] = (wrongAnswerByKnowledge[know] || 0) + 1;
        answerDetail += (question.options || []).map(a => a.optionText || a.correctAnswerForBlank).join("\n") + "\n";
        incorrectAnswer.push({ questionContent: question.questionText, answerDetail, knowledge: know });
      }
      listeningQuestionDetails.push(detail);
    }

    // Finalize and save
    const suggestionQuestion = await Question.find({ knowledge: { $in: Object.keys(wrongAnswerByKnowledge) } }).select("_id content");
    const totalQuestions = (exam.questions?.length || 0) + exam.listeningExams.reduce((a, le) => a + (le.questions?.length || 0), 0);
    const finalScore = Math.round((correctAnswer / totalQuestions * 10) * 100) / 100;

    Object.assign(existingResult, {
      score: finalScore,
      correctAnswer,
      wrongAnswer,
      questions: questionDetails,
      listeningQuestions: listeningQuestionDetails,
      suggestionQuestion,
      wrongAnswerByKnowledge,
      answerDetail,
      isCompleted: true,
      endTime: new Date()
    });
    await existingResult.save();

    // Fetch YouTube videos
    const videos = {};
   

    // Build AI prompt
    let prompt2 = incorrectAnswer.map(q => `Đây là câu hỏi tiếng anh (${q.questionContent}), đáp án: ${q.answerDetail}, kiến thức: ${q.knowledge}.`).join(" ");
    let prompt = "Hãy đưa ra lời khuyên, lộ trình học tiếng Anh biết học sinh đẫ làm các câu trả lời sai sau đây: " + prompt2;
    return res.status(200).json({
      code: 200,
      message: "Exam submitted successfully!",
      examId: exam._id,
      userId: existingResult.userId,
      score: finalScore,
      correctAnswer,
      wrongAnswer,
      unAnswerQ,
      totalQuestion: totalQuestions,
      details: questionDetails,
      listeningQuestions: listeningQuestionDetails,
      wrongAnswerByKnowledge,
      suggestionQuestion,
      videos,
      arrResponse: prompt
    });
  } catch (error) {
    console.error("Error processing exam:", error);
    return res.status(500).json({ message: "Error submitting exam.", error: error.message });
  }
};


// [GET]: /result/wrong-questions/:resultId
export const getWrongQuestions = async (req, res) => {
  const { resultId } = req.params;
  try {
    const result = await Result.findById(resultId)
      .populate({
        path: "questions.questionId",
        populate: [{ path: "listeningQuestions" }],
      })
      .populate({
        path: "listeningQuestions.questionId",
        populate: [{ path: "listeningQuestions" }],
      });
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }
    const wrongQuestions = result.questions.filter((q) => !q.isCorrect);
    const wrongListeningQuestions = result.listeningQuestions.filter(
      (q) => !q.isCorrect
    );
    res.status(200).json({
      code: 200,
      message: "Wrong questions fetched successfully.",
      wrongQuestions,
      wrongListeningQuestions,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Failed to fetch wrong questions",
      error,
    });
  }
};

