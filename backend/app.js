import express from "express";
import { redisService } from "./config/redis.config.js";
import { connect } from "./config/db.config.js";

import { ENV_VARS } from "./config/envVars.config.js";
import cors from "cors";

import cookieParser from "cookie-parser";
import indexClient from "./routes/client/index.route.js";
import indexTeacher from "./routes/teacher/index.route.js";
connect();
const app = express();
;
// Configure CORS
app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, 
  })
);
app.use(express.json());
app.use(cookieParser());
await redisService.connect();


indexClient(app);
indexTeacher(app);


app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});


app.listen(5000)
