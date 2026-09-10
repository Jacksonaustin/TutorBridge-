// Accepts either 24-hour time, or 12-hour time.
const TIME_PATTERN =
  /^(([01]\d|2[0-3]):[0-5]\d|(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM))$/i;

// These limits match the fields defined in the TutoringRequest model.
const FIELD_LIMITS = {
  subject: 100,
  topic: 150,
  description: 2000,
};

// Converts a supported time string into hours and minutes.
function parseTime(time) {
  if (typeof time !== "string") {
    return null;
  }

  const value = time.trim();

  // 24-hour time, such as 15:30.
  const twentyFourHourMatch = value.match(
    /^([01]\d|2[0-3]):([0-5]\d)$/
  );

  if (twentyFourHourMatch) {
    return {
      hours: Number(twentyFourHourMatch[1]),
      minutes: Number(twentyFourHourMatch[2]),
    };
  }

  // 12-hour time, such as 3:30 PM.
  const twelveHourMatch = value.match(
    /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i
  );

  if (!twelveHourMatch) {
    return null;
  }

  let hours = Number(twelveHourMatch[1]);
  const minutes = Number(twelveHourMatch[2]);
  const period = twelveHourMatch[3].toUpperCase();

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  return {
    hours,
    minutes,
  };
}

// Creates a Date using a YYYY-MM-DD date and a supported time string.
// This is also used as a fallback for API clients that do not send
// requestedDateTime.
export function createRequestedDateTime(requestedDate, requestedTime) {
  if (
    typeof requestedDate !== "string" ||
    typeof requestedTime !== "string"
  ) {
    return null;
  }

  const dateMatch = requestedDate
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})/);

  const time = parseTime(requestedTime);

  if (!dateMatch || !time) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);

  const date = new Date(
    year,
    month - 1,
    day,
    time.hours,
    time.minutes,
    0,
    0
  );

  // Make sure JavaScript did not automatically correct
  // an invalid date such as February 31.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

// Validates tutoring-request data for both creation and editing.
// Creation requires every request field.
// Partial mode validates only supplied fields.
// Returns an array of errors, or an empty array when the data is valid.
export function validateTutoringRequest(
  body = {},
  { partial = false } = {}
) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be a JSON object."];
  }

  // Validate subject, topic, and description.
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const value = body[field];

    if (
      !partial &&
      (typeof value !== "string" || value.trim() === "")
    ) {
      errors.push(`${field} is required.`);
    } else if (value !== undefined) {
      if (
        typeof value !== "string" ||
        value.trim() === ""
      ) {
        errors.push(`${field} must be non-empty text.`);
      } else if (value.trim().length > limit) {
        errors.push(
          `${field} must contain no more than ${limit} characters.`
        );
      }
    }
  }

  // Validate date.
  if (!partial && !body.requestedDate) {
    errors.push("requestedDate is required.");
  } else if (body.requestedDate !== undefined) {
    if (
      typeof body.requestedDate !== "string" ||
      Number.isNaN(Date.parse(body.requestedDate))
    ) {
      errors.push("requestedDate must be a valid date.");
    }
  }

  // Validate time.
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

  // The browser sends this exact ISO date/time so deployment timezone
  // differences do not change when the request should expire.
  if (body.requestedDateTime !== undefined) {
    if (
      typeof body.requestedDateTime !== "string" ||
      Number.isNaN(Date.parse(body.requestedDateTime))
    ) {
      errors.push("requestedDateTime must be a valid date and time.");
    } else if (new Date(body.requestedDateTime) <= new Date()) {
      errors.push("Requested date and time must be in the future.");
    }
  } else if (
    typeof body.requestedDate === "string" &&
    typeof body.requestedTime === "string" &&
    !Number.isNaN(Date.parse(body.requestedDate)) &&
    TIME_PATTERN.test(body.requestedTime.trim())
  ) {
    // Fallback for direct API calls that only send requestedDate/requestedTime.
    const requestedDateTime = createRequestedDateTime(
      body.requestedDate,
      body.requestedTime
    );

    if (
      requestedDateTime &&
      requestedDateTime <= new Date()
    ) {
      errors.push("Requested date and time must be in the future.");
    }
  }

  return errors;
}
