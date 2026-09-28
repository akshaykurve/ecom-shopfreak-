const { body, param, query } = require("express-validator");
const Product = require("../models/product.model");

const SIZES = Product.SIZES;

const idParamValidator = [
  param("id").isMongoId().withMessage("Invalid product id"),
];

const listProductsValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("category").optional().trim().isLength({ max: 100 }).withMessage("category is too long"),
  query("search").optional().trim().isLength({ max: 100 }).withMessage("search is too long"),
];

const productBodyValidator = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("description").optional().trim(),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("images").optional().isArray().withMessage("Images must be an array"),
  body("sizes")
    .optional()
    .isArray()
    .withMessage("Sizes must be an array"),
  body("sizes.*.size")
    .optional()
    .isIn(SIZES)
    .withMessage(`Size must be one of ${SIZES.join(", ")}`),
  body("sizes.*.stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("isListed").optional().isBoolean().withMessage("isListed must be a boolean"),
];

const createProductValidator = [...productBodyValidator];

const updateProductValidator = [...idParamValidator, ...productBodyValidator];

module.exports = {
  idParamValidator,
  listProductsValidator,
  createProductValidator,
  updateProductValidator,
};
