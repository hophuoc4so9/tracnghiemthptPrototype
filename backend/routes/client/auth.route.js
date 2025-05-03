import express from "express";
const router = express.Router();
import {
  signup,
  login,
  logout,

} from "../../controllers/client/auth.controller.js";
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
