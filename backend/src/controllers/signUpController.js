import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { validateSignup } from "../utils/validation.js";
import {
  publicUser,
  regenerateSession,
  saveSession,
} from "./authController.js";

export async function signup(req, res, next) {
  try {
    const errors = validateSignup(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const major = req.body.major?.trim() || "";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with that email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      major,
    });

    await regenerateSession(req);

    req.session.userId = user._id.toString();

    await saveSession(req);

    return res.status(201).json({
      user: publicUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "An account with that email already exists.",
      });
    }

    next(error);
  }
}
