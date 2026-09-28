const { validationResult } = require("express-validator");

// Runs after an express-validator chain. If any rule failed, respond with
// field-level 400 errors before the request ever reaches the controller.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
