const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Access token: short-lived, carries id + role, sent back in the JSON body.
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

// Refresh token: long-lived, sent as an httpOnly cookie. `jti` is a random id
// so two tokens issued in the same second (e.g. back-to-back rotations) are
// never byte-identical - jwt's `iat` alone only has second-level precision,
// which would otherwise make rotation a no-op and defeat reuse detection.
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, jti: crypto.randomUUID() },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Refresh tokens are hashed with SHA-256 before being stored, not bcrypt.
// bcrypt truncates its input at 72 bytes, and every refresh JWT here shares
// a long identical prefix (header + the user's id, which comes first in the
// payload) - the part that actually differs between tokens (jti/iat) lands
// past that 72-byte cutoff, so bcrypt would compare truncated-equal tokens
// as a match even when they're different tokens. SHA-256 has no such
// truncation and is the right tool for hashing a high-entropy random token
// (bcrypt's slow cost function is for low-entropy secrets like passwords).
const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshCookieOptions,
  hashRefreshToken,
};
