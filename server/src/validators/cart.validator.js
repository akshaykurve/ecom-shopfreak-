const { body, param } = require("express-validator");
const Product = require("../models/product.model");

const SIZES = Product.SIZES;

const addItemValidator = [
  body("productId").isMongoId().withMessage("Invalid product id"),
  body("size").isIn(SIZES).withMessage(`Size must be one of ${SIZES.join(", ")}`),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

const updateItemValidator = [
  param("productId").isMongoId().withMessage("Invalid product id"),
  body("size").isIn(SIZES).withMessage(`Size must be one of ${SIZES.join(", ")}`),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

const removeItemValidator = [
  param("productId").isMongoId().withMessage("Invalid product id"),
  body("size").isIn(SIZES).withMessage(`Size must be one of ${SIZES.join(", ")}`),
];

module.exports = { addItemValidator, updateItemValidator, removeItemValidator };
