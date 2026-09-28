const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const {
  generateAccessToken,
  generateRefreshToken,
  refreshCookieOptions,
  hashRefreshToken,
} = require("../utils/generateTokens");

const SALT_ROUNDS = 10;

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "buyer",
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const refreshTokenHandler = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken;

  if (!incomingToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token, please log in again",
    });
  }

  const user = await User.findById(decoded.id);

  if (!user || !user.refreshTokenHash) {
    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token, please log in again",
    });
  }

  // If the token doesn't match the one stored on the user, it's either an
  // old, already-rotated token being reused, or it never belonged to this user.
  const isValid = hashRefreshToken(incomingToken) === user.refreshTokenHash;
  if (!isValid) {
    user.refreshTokenHash = null;
    await user.save();
    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.status(403).json({
      success: false,
      message: "Refresh token reuse detected, please log in again",
    });
  }

  // Rotate: issue a brand-new access + refresh token pair.
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashRefreshToken(newRefreshToken);
  await user.save();

  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

  res.status(200).json({
    success: true,
    message: "Access token refreshed",
    accessToken: newAccessToken,
  });
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { refreshTokenHash: null });
  res.clearCookie("refreshToken", refreshCookieOptions);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -refreshTokenHash");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    user,
  });
});

module.exports = {
  register,
  login,
  refreshTokenHandler,
  logout,
  me,
};
