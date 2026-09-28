import { Link } from "react-router";
import ProductImage from "./ProductImage";
import { formatPrice } from "../utils/formatPrice";

function ProductCard({ product }) {
  const image = product.images?.[0];

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <ProductImage
          src={image}
          alt={product.name}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {product.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
        <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;
