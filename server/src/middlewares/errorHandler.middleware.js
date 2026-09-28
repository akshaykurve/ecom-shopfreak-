// Catches anything asyncHandler forwards (unexpected errors - DB issues,
// bugs, etc.) plus anything else Express routes to an error handler.
// Expected business-logic responses (404/401/403/409) are still returned
// directly from controllers and never reach this file.
const errorHandler = (err, req, res, next) => {
  console.error("🚀 ~ errorHandler ~", err);

  // Mongoose sends its own distinct error shapes for these - map them to
  // sensible HTTP statuses instead of a generic 500.
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid identifier" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate value" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Something went wrong, please try again"
      : err.message || "Server error";

  res.status(statusCode).json({ success: false, message });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

module.exports = { errorHandler, notFoundHandler };
