const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup({ name, email, password, major } = {}) {
  const errors = [];

  if (typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name must contain at least 2 characters.");
  } else if (name.trim().length > 80) {
    errors.push("Name must contain no more than 80 characters.");
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    errors.push("A valid email is required.");
  } else if (email.trim().length > 254) {
    errors.push("Email must contain no more than 254 characters.");
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must contain at least 8 characters.");
  }

  if (Buffer.byteLength(password || "", "utf8") > 72) {
    errors.push("Password is too long.");
  }

  if (major !== undefined) {
    if (typeof major !== "string") {
      errors.push("Major must be text.");
    } else if (major.trim().length > 100) {
      errors.push("Major must contain no more than 100 characters.");
    }
  }

  return errors;
}

export function validateLogin({ email, password } = {}) {
  const errors = [];

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    errors.push("A valid email is required.");
  }

  if (typeof password !== "string" || password.length === 0) {
    errors.push("Password is required.");
  }

  return errors;
}
