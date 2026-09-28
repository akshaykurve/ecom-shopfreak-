const mongoose = require("mongoose");

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const sizeStockSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: SIZES,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [sizeStockSchema],
      default: [],
    },
    isListed: {
      type: Boolean,
      default: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.statics.SIZES = SIZES;

module.exports = mongoose.model("Product", productSchema);
