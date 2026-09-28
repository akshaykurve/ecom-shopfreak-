const Product = require("../models/product.model");
const asyncHandler = require("../utils/asyncHandler");

// Escapes regex special characters so a search term is matched literally,
// not interpreted as a (potentially catastrophic) regex pattern.
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, images, sizes } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    category,
    images,
    sizes,
    seller: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

// Public listing - only products the seller hasn't unlisted show up here.
const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const filter = { isListed: true };

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.search) {
    filter.name = { $regex: escapeRegex(req.query.search), $options: "i" };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  if (!product.seller.equals(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "You can only update your own products",
    });
  }

  const { name, description, price, category, images, sizes, isListed } = req.body;

  product.name = name;
  product.description = description ?? product.description;
  product.price = price;
  product.category = category;
  if (images !== undefined) product.images = images;
  if (sizes !== undefined) product.sizes = sizes;
  if (isListed !== undefined) product.isListed = isListed;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  if (!product.seller.equals(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own products",
    });
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// Seller dashboard - lists all of the seller's own products, including unlisted ones.
const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Your products fetched successfully",
    products,
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
};
