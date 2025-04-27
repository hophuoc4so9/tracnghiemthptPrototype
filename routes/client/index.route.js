import authRoute from "./auth.route.js";
import examRoute from "./exam.route.js";
import resultRoute from "./result.route.js";


import { protectedRoute } from "../../middlewares/protectedRoute.middleware.js";

const indexClient = (app) => {
  app.use("/auth", authRoute);
  app.use(protectedRoute);
  app.use("/exam", examRoute);
  app.use("/result", resultRoute);
};

export default indexClient;
