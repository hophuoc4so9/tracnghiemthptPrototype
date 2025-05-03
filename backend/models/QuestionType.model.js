import mongoose from "mongoose";
const QuestionTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  deleted: { type: Boolean, default: false },
});

export const QuestionType = mongoose.model("QuestionType", QuestionTypeSchema);
