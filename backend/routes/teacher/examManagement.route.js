import express from "express";
import {
  createExam,
  deleteExam,
  getAllExams,
  getExamDetail,
  setExamSchedule,
  toggleExamVisibility,
  updateExam,
  autoGenerateExam,

} from "../../controllers/teacher/examManagement.controller.js";
import multer from "multer";

 
const router = express.Router();
router.get("/", getAllExams);

router.get("/detail/:slug", getExamDetail);

router.post("/create", createExam);

router.patch("/update/:slug", updateExam);

router.delete("/delete/:id", deleteExam);

router.patch("/toggle-visibility/:id", toggleExamVisibility);

router.patch("/schedule/:id", setExamSchedule);

router.post("/auto-generate-exam", autoGenerateExam);


export default router;
