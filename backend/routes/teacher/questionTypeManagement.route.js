import express from "express";
import {
  index,
  createPost,
  update,
  updatePatch,
  deletePatch,
  getAllQuestionTypes,
} from "../../controllers/teacher/questionTypeManagement.controller.js";
import { protectedRoute, isTeacher } from "../../middlewares/protectedRoute.middleware.js";

const router = express.Router();

router.use(protectedRoute);
router.use(isTeacher);

router.get("/", getAllQuestionTypes);
router.post("/create", createPost);
router.get("/update/:id", update);
router.patch("/update/:id", updatePatch);
router.patch("/delete/:id", deletePatch);

export default router;
