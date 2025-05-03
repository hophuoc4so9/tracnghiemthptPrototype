import express from "express";
const router = express.Router();

import { getAllResults, getWrongQuestions, submitExam,getDontCompletedExam } from "../../controllers/client/result.controller.js";

router.post("/submit", submitExam);

router.get("/", getAllResults);


router.get("/wrong-questions/:resultId", getWrongQuestions);
router.get("/check-incomplete-exams", getDontCompletedExam);

// Route mới cho getDontCompletedExam


export default router;
