const rateLimit = require("express-rate-limit");

// Slows down brute-force attempts against login/register without affecting
// normal usage - 20 attempts per 15 minutes per IP is generous for a real
// user but painful for a password-guessing script.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});

module.exports = { authLimiter };
