import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchProductById } from "../features/products/productSlice";
import { addToCart } from "../features/cart/cartSlice";
import SizeSelector from "../components/SizeSelector";
import Loader from "../components/Loader";
import ProductImage from "../components/ProductImage";
import { formatPrice } from "../utils/formatPrice";

function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector((state) => state.products.current);
  const user = useSelector((state) => state.auth.user);
  const cartStatus = useSelector((state) => state.cart.status);

  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    dispatch(fetchProductById(id));
    setSelectedSize(null);
  }, [dispatch, id]);

  if (!product || product._id !== id) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    const result = await dispatch(addToCart({ productId: product._id, size: selectedSize, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) {
      toast.success("Added to cart");
    } else {
      toast.error(result.payload || "Failed to add to cart");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
        <ProductImage src={product.images?.[0]} alt={product.name} iconSize={48} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">
          {product.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
        <p className="mt-3 text-xl font-semibold text-indigo-600 dark:text-indigo-400">
          {formatPrice(product.price)}
        </p>
        {product.description && (
          <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {product.description}
          </p>
        )}

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">Size</p>
          <SizeSelector sizes={product.sizes} selected={selectedSize} onSelect={setSelectedSize} />
        </div>

        <div className="mt-6">
          {user ? (
            <button
              onClick={handleAddToCart}
              disabled={cartStatus === "loading"}
              className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 sm:w-auto"
            >
              Add to cart
            </button>
          ) : (
            <Link to="/login" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
              Log in to add this to your cart
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
