import express from "express";
import { signup } from "../controllers/signUpController.js";
import { login } from "../controllers/loginController.js";
import { logout } from "../controllers/logoutController.js";
import { getCurrentUser } from "../controllers/currentUserController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getCurrentUser);

export default router;
