import User from "../models/User.js";
import { publicUser } from "./authController.js";

// GET /api/auth/me
// Returns the user on the current authenticated session.
export async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    return res.status(200).json({
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}
