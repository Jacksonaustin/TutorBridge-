// Converts a User document into the safe user data returned by auth endpoints.
// The password hash is intentionally never included.
export function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    major: user.major,
    createdAt: user.createdAt,
  };
}

// Replaces the current session after signup or login.
export function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

// Makes sure the authenticated session is stored before an API response is sent.
export function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
