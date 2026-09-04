// POST /api/auth/logout
// Destroys the authenticated session and clears its browser cookie.
export function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie("tutorbridge.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.sendStatus(204);
  });
}
