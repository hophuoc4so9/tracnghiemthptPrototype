import express from "express";
const router = express.Router();

import { getAllResults, getWrongQuestions, submitExam } from "../../controllers/client/result.controller.js";

router.post("/submit", submitExam);

router.get("/", getAllResults);


router.get("/wrong-questions/:resultId", getWrongQuestions);

// Route mới cho getDontCompletedExam


export default router;
