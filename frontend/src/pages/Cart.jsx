import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { fetchCart, updateCartItem, removeCartItem, clearCart } from "../features/cart/cartSlice";
import Loader from "../components/Loader";
import ProductImage from "../components/ProductImage";
import { formatPrice } from "../utils/formatPrice";

function Cart() {
  const dispatch = useDispatch();
  const { cart, status } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const getStockFor = (item) =>
    item.product?.sizes?.find((s) => s.size === item.size)?.stock ?? Infinity;

  const handleQuantityChange = (item, quantity) => {
    if (quantity < 1) return;
    const stock = getStockFor(item);
    if (quantity > stock) {
      toast.error(`Only ${stock} left in size ${item.size}`);
      return;
    }
    dispatch(updateCartItem({ productId: item.product._id, size: item.size, quantity }));
  };

  const handleRemove = (item) => {
    dispatch(removeCartItem({ productId: item.product._id, size: item.size }));
  };

  const handleClear = async () => {
    if (!window.confirm("Remove all items from your cart?")) return;

    const result = await dispatch(clearCart());
    if (clearCart.fulfilled.match(result)) {
      toast.success("Cart cleared");
    }
  };

  if (status === "loading" && !cart) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Your cart</h1>
        <p className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          Your cart is empty.{" "}
          <Link to="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Continue shopping
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">
        Your cart
      </h1>

      <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
        {items.map((item) => (
          <div
            key={`${item.product._id}-${item.size}`}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex items-center gap-3 sm:flex-1">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                <ProductImage src={item.product?.images?.[0]} alt={item.product?.name} iconSize={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.product?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Size: {item.size}</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  {formatPrice(item.product?.price)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                  className="h-7 w-7 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm text-gray-900 dark:text-gray-100">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                  disabled={item.quantity >= getStockFor(item)}
                  title={item.quantity >= getStockFor(item) ? "No more in stock" : undefined}
                  className="h-7 w-7 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => handleRemove(item)}
                className="text-xs text-red-600 hover:underline dark:text-red-400"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
        <button
          onClick={handleClear}
          className="text-left text-sm text-gray-500 hover:underline dark:text-gray-400"
        >
          Clear cart
        </button>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Total: {formatPrice(total)}
        </p>
      </div>
    </div>
  );
}

export default Cart;
