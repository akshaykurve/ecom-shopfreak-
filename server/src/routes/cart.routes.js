const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  addItemValidator,
  updateItemValidator,
  removeItemValidator,
} = require("../validators/cart.validator");
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} = require("../controllers/cart.controller");

router.use(authenticate);

router.get("/", getCart);
router.post("/items", addItemValidator, validate, addItem);
router.put("/items/:productId", updateItemValidator, validate, updateItem);
router.delete("/items/:productId", removeItemValidator, validate, removeItem);
router.delete("/", clearCart);

module.exports = router;
