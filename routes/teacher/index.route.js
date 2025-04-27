import examManagementRoute from "./examManagement.route.js";

import {
  protectedRoute,
} from "../../middlewares/protectedRoute.middleware.js";


const indexTeacher = (app) => {
  app.use(protectedRoute); // Đảm bảo người dùng đã đăng nhập
  app.use("/teacher/exam", examManagementRoute);
};
export default indexTeacher;
