// Accepts either 24-hour time (15:30) or 12-hour time (3:30 PM).
const TIME_PATTERN =
  /^(([01]\d|2[0-3]):[0-5]\d|(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM))$/i;

// These limits match the fields defined in the TutoringRequest model.
const FIELD_LIMITS = {
  subject: 100,
  topic: 150,
  description: 2000,
};

// Validates tutoring-request data for both creation and editing.
// Creation requires every request field; partial mode validates only supplied fields.
// Returns an array of errors, or an empty array when the data is valid.
export function validateTutoringRequest(body = {}, { partial = false } = {}) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be a JSON object."];
  }

  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const value = body[field];

    if (!partial && (typeof value !== "string" || value.trim() === "")) {
      errors.push(`${field} is required.`);
    } else if (value !== undefined) {
      if (typeof value !== "string" || value.trim() === "") {
        errors.push(`${field} must be non-empty text.`);
      } else if (value.trim().length > limit) {
        errors.push(`${field} must contain no more than ${limit} characters.`);
      }
    }
  }

  if (!partial && !body.requestedDate) {
    errors.push("requestedDate is required.");
  } else if (
    body.requestedDate !== undefined &&
    Number.isNaN(Date.parse(body.requestedDate))
  ) {
    errors.push("requestedDate must be a valid date.");
  }

  if (!partial && !body.requestedTime) {
    errors.push("requestedTime is required.");
  } else if (body.requestedTime !== undefined) {
    if (
      typeof body.requestedTime !== "string" ||
      !TIME_PATTERN.test(body.requestedTime.trim())
    ) {
      errors.push(
        "requestedTime must use a format such as 15:30 or 3:30 PM."
      );
    }
  }

  return errors;
}
