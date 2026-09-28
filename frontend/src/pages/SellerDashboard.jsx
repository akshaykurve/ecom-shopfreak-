import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { fetchMyProducts, updateProduct, deleteProduct } from "../features/products/productSlice";
import Loader from "../components/Loader";
import ProductImage from "../components/ProductImage";
import { formatPrice } from "../utils/formatPrice";

function SellerDashboard() {
  const dispatch = useDispatch();
  const { myItems, status } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchMyProducts());
  }, [dispatch]);

  const handleToggleListed = (product) => {
    dispatch(
      updateProduct({
        id: product._id,
        productData: {
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          images: product.images,
          sizes: product.sizes,
          isListed: !product.isListed,
        },
      })
    );
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;

    const result = await dispatch(deleteProduct(product._id));
    if (deleteProduct.fulfilled.match(result)) {
      toast.success("Product deleted");
    } else {
      toast.error(result.payload || "Failed to delete product");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">
          Your products
        </h1>
        <Link
          to="/seller/products/new"
          className="inline-block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          + Add product
        </Link>
      </div>

      {status === "loading" && (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      )}

      {status === "succeeded" && myItems.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          You haven't listed any products yet.
        </p>
      )}

      <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
        {myItems.map((product) => (
          <div
            key={product._id}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex items-center gap-3 sm:flex-1">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                <ProductImage src={product.images?.[0]} alt={product.name} iconSize={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {product.category} · {formatPrice(product.price)}
                </p>
                {!product.isListed && (
                  <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Unlisted
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs sm:shrink-0">
              <Link
                to={`/seller/products/${product._id}/edit`}
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Edit
              </Link>
              <button
                onClick={() => handleToggleListed(product)}
                className="text-gray-600 hover:underline dark:text-gray-400"
              >
                {product.isListed ? "Unlist" : "Relist"}
              </button>
              <button
                onClick={() => handleDelete(product)}
                className="text-red-600 hover:underline dark:text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SellerDashboard;
