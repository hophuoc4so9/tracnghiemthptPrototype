import express from "express";
import {
  getAllExams,
  getExamDetail,
} from "../../controllers/teacher/examManagement.controller.js";


const router = express.Router();
router.get("/", getAllExams);

router.get("/detail/:slug", getExamDetail);


export default router;
