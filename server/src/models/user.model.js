const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer",
    },
    // SHA-256 hash of the current refresh token (not bcrypt - see
    // src/utils/generateTokens.js for why), so a DB leak alone can't be
    // replayed as a valid session.
    refreshTokenHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
