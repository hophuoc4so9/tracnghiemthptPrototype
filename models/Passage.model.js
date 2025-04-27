import mongoose from "mongoose";

const PassageSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Passage = mongoose.model("Passage", PassageSchema);
