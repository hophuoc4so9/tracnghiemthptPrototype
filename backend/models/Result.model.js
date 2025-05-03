import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "TaiKhoan", required: true },
  score: { type: Number, required: true },
  correctAnswer: { type: Number, required: true },
  wrongAnswer: { type: Number, required: true },
  questions: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      content: { type: String, required: true, default: " " },
      answers: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, required: true },
          text: { type: String },
          correctAnswerForBlank: { type: String },
          isCorrect: { type: Boolean, required: true },
        },
      ],
      selectedAnswerId: { type: mongoose.Schema.Types.ObjectId },
      userAnswers: [
        {
          userAnswer: { type: String },
          answerId: { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },
          isCorrect: { type: Boolean, default: false },
        },
      ],
      isCorrect: { type: Boolean, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  suggestionQuestion: {
    type: Array,
    default: [],
  },
  wrongAnswerByKnowledge: {
    type: Object,
    default: {},
  },
  isCompleted: { type: Boolean, default: false }, // Thêm trạng thái hoàn thành
  endTime: { type: Date }, // Thêm thời gian kết thúc
});

const Result = mongoose.model("Result", ResultSchema);
export default Result;
