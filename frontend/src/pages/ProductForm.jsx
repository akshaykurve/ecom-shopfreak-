import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchProductById,
  createProduct,
  updateProduct,
} from "../features/products/productSlice";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const emptySizes = SIZES.map((size) => ({ size, stock: 0 }));

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  images: "",
  sizes: emptySizes,
};

const inputClass =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500";

function ProductForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const current = useSelector((state) => state.products.current);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && current?._id === id) {
      setForm({
        name: current.name,
        description: current.description || "",
        price: current.price,
        category: current.category,
        images: (current.images || []).join(", "),
        sizes: SIZES.map((size) => {
          const existing = current.sizes?.find((s) => s.size === size);
          return { size, stock: existing ? existing.stock : 0 };
        }),
      });
    }
  }, [current, id, isEditMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStockChange = (size, stock) => {
    setForm({
      ...form,
      sizes: form.sizes.map((s) => (s.size === size ? { ...s, stock: Number(stock) } : s)),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const productData = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      images: form.images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean),
      sizes: form.sizes,
    };

    const result = isEditMode
      ? await dispatch(updateProduct({ id, productData }))
      : await dispatch(createProduct(productData));

    setSubmitting(false);

    const thunk = isEditMode ? updateProduct : createProduct;
    if (thunk.fulfilled.match(result)) {
      toast.success(isEditMode ? "Product updated" : "Product created");
      navigate("/seller/dashboard");
    } else {
      toast.error(result.payload || "Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">
        {isEditMode ? "Edit product" : "New product"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className={inputClass}
        />
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="number"
            name="price"
            placeholder="Price (Rs)"
            value={form.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className={`flex-1 ${inputClass}`}
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            required
            className={`flex-1 ${inputClass}`}
          />
        </div>
        <input
          type="text"
          name="images"
          placeholder="Image URLs, comma separated"
          value={form.images}
          onChange={handleChange}
          className={inputClass}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            Stock per size
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {form.sizes.map(({ size, stock }) => (
              <label
                key={size}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                {size}
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => handleStockChange(size, e.target.value)}
                  className={`w-16 ${inputClass}`}
                />
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? "Saving..." : isEditMode ? "Save changes" : "Create product"}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;
