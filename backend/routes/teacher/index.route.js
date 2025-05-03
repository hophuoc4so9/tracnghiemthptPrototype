import questionManagementRoute from "./questionManagement.route.js";
import examManagementRoute from "./examManagement.route.js";
import questionTypeManagementRoute from "./questionTypeManagement.route.js";
import {
  protectedRoute,
  isTeacher,
} from "../../middlewares/protectedRoute.middleware.js";


const indexTeacher = (app) => {
  app.use(protectedRoute); // Đảm bảo người dùng đã đăng nhập
  app.use("/teacher", isTeacher, questionManagementRoute);
  app.use("/teacher/exam", isTeacher, examManagementRoute);
  app.use("/teacher/question-types", questionTypeManagementRoute);
};
export default indexTeacher;
