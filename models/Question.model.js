import mongoose from "mongoose";
const QuestionSchema = new mongoose.Schema({
  passageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Passage",
    default: null,
  }, // Liên kết bài đọc (nếu có)
  instruction: { type: String, default: "" },
  content: { type: String, default: "" },
  topic: {
    type: String,
    default: "",
  },
  questionType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionType",
    require: true,
  },
  level: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
  },

  answers: [
    {
      text: { type: String, default: "" },
      correctAnswerForBlank: { type: String, default: "" },
      isCorrect: { type: Boolean, default: false },
    },
  ],
  correctAnswerForTrueFalseNGV: {
    type: String,
    enum: ["true", "false", "notgiven", ""],
    default: "",
  },
  subject: { type: String, default: "English" },
  knowledge: {
    type: String,
    default: "General Knowledge",
  },
  translation: {
    type: String,
    default: "",
  },
  explanation: {
    type: String,
    default: "",
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Taikhoan" },
  isApproved: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Question = mongoose.model("Question", QuestionSchema);