export function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    major: user.major,
    createdAt: user.createdAt,
  };
}

export function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
