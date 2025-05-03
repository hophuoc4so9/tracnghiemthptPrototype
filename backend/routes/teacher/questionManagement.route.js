import express from "express";
import fileUpload from "express-fileupload";
import {
  questionManagement,
  createPost,
  detail,
  update,
  deletePatch,
  updatePatch,
} from "../../controllers/teacher/questionManagement.controller.js";

const router = express.Router();


// Các route của hệ thống
router.get("/question-management", questionManagement);
router.get("/question/detail/:id", detail);
router.get("/question/update/:id", update);
router.patch("/question/delete/:id", deletePatch);
router.patch("/question/update/:id", updatePatch);

// Route cho tạo mới câu hỏi với validation
router.post("/question/create", createPost);


export default router;
