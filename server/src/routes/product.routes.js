const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  idParamValidator,
  listProductsValidator,
  createProductValidator,
  updateProductValidator,
} = require("../validators/product.validator");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require("../controllers/product.controller");

// More specific than "/:id", so it must be declared first.
router.get("/seller/mine", authenticate, authorize("seller"), getMyProducts);

router.post(
  "/",
  authenticate,
  authorize("seller"),
  createProductValidator,
  validate,
  createProduct
);
router.get("/", listProductsValidator, validate, getProducts);
router.get("/:id", idParamValidator, validate, getProductById);
router.put(
  "/:id",
  authenticate,
  authorize("seller"),
  updateProductValidator,
  validate,
  updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize("seller"),
  idParamValidator,
  validate,
  deleteProduct
);

module.exports = router;
