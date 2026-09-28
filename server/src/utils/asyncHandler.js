// Wraps an async route handler so a rejected promise (thrown error) is
// forwarded to next(err) instead of crashing the request unhandled. Removes
// the need for a try/catch block in every single controller.
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = asyncHandler;
