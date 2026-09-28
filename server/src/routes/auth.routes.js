const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate.middleware");
const validate = require("../middlewares/validate.middleware");
const { registerValidator, loginValidator } = require("../validators/auth.validator");
const {
  register,
  login,
  refreshTokenHandler,
  logout,
  me,
} = require("../controllers/auth.controller");

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/refresh-token", refreshTokenHandler);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

module.exports = router;
