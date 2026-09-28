import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import { fetchProducts } from "../features/products/productSlice";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const inputClass =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500";

function Home() {
  const dispatch = useDispatch();
  const { items, pagination, status } = useSelector((state) => state.products);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedCategory, setDebouncedCategory] = useState("");
  const [page, setPage] = useState(1);

  // Inputs stay responsive immediately; the committed (debounced) values -
  // which also reset the page back to 1 - only update 400ms after typing stops.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedCategory(category);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, category]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        search: debouncedSearch || undefined,
        category: debouncedCategory || undefined,
        page,
        limit: 20,
      })
    );
  }, [dispatch, debouncedSearch, debouncedCategory, page]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">Shop</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Browse everything our sellers have listed.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <FiSearch
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 sm:w-56 ${inputClass}`}
            />
          </div>
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full sm:w-40 ${inputClass}`}
          />
        </div>
      </div>

      {status === "loading" && (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      )}

      {status === "succeeded" && items.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {debouncedSearch || debouncedCategory
            ? "No products match your filters."
            : "No products available yet."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {items.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pagination.page <= 1}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
