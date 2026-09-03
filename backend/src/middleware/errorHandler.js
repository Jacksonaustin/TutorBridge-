export default function errorHandler(error, req, res, next) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      message: "Request body contains invalid JSON.",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      message: "A record with that value already exists.",
    });
  }

  return res.status(500).json({
    message: "An unexpected server error occurred.",
  });
}
