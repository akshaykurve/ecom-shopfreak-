const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const asyncHandler = require("../utils/asyncHandler");

const CART_POPULATE_FIELDS = "name price images isListed sizes";

// Every read/write here works against "the caller's own cart", creating it
// on first use, since a user always has exactly one cart.
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  await cart.populate("items.product", CART_POPULATE_FIELDS);

  res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    cart,
  });
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, size, quantity } = req.body;
  const qty = quantity || 1;

  const product = await Product.findById(productId);
  if (!product || !product.isListed) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const sizeEntry = product.sizes.find((s) => s.size === size);
  if (!sizeEntry || sizeEntry.stock <= 0) {
    return res.status(400).json({
      success: false,
      message: `Size ${size} is currently unavailable for this product`,
    });
  }

  const cart = await getOrCreateCart(req.user.id);
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId && item.size === size
  );
  const requestedTotal = (existingItem?.quantity || 0) + qty;

  if (requestedTotal > sizeEntry.stock) {
    return res.status(400).json({
      success: false,
      message: `Only ${sizeEntry.stock} left in size ${size}`,
    });
  }

  if (existingItem) {
    existingItem.quantity = requestedTotal;
  } else {
    cart.items.push({ product: productId, size, quantity: qty });
  }

  await cart.save();
  await cart.populate("items.product", CART_POPULATE_FIELDS);

  res.status(200).json({
    success: true,
    message: "Item added to cart",
    cart,
  });
});

const updateItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size, quantity } = req.body;

  const cart = await getOrCreateCart(req.user.id);
  const item = cart.items.find(
    (item) => item.product.toString() === productId && item.size === size
  );

  if (!item) {
    return res.status(404).json({ success: false, message: "Item not found in cart" });
  }

  const product = await Product.findById(productId);
  const sizeEntry = product?.sizes.find((s) => s.size === size);

  if (!product || !sizeEntry || sizeEntry.stock <= 0) {
    return res.status(400).json({
      success: false,
      message: `Size ${size} is currently unavailable for this product`,
    });
  }

  if (quantity > sizeEntry.stock) {
    return res.status(400).json({
      success: false,
      message: `Only ${sizeEntry.stock} left in size ${size}`,
    });
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product", CART_POPULATE_FIELDS);

  res.status(200).json({
    success: true,
    message: "Cart item updated",
    cart,
  });
});

const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size } = req.body;

  const cart = await getOrCreateCart(req.user.id);
  cart.items = cart.items.filter(
    (item) => !(item.product.toString() === productId && item.size === size)
  );

  await cart.save();
  await cart.populate("items.product", CART_POPULATE_FIELDS);

  res.status(200).json({
    success: true,
    message: "Item removed from cart",
    cart,
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart cleared",
    cart,
  });
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
