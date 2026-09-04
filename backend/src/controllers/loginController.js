import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { validateLogin } from "../utils/validation.js";
import {
  publicUser,
  regenerateSession,
  saveSession,
} from "./authController.js";

// POST /api/auth/login
// Verifies an email and password, then makes an authenticated session.
export async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const email = req.body.email.trim().toLowerCase();

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    await regenerateSession(req);

    req.session.userId = user._id.toString();

    await saveSession(req);

    return res.status(200).json({
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}
