// Out-of-stock sizes are always rendered (never hidden), just disabled and
// labeled "Unavailable", so the buyer can see the full size range.
function SizeSelector({ sizes = [], selected, onSelect }) {
  if (sizes.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No sizes configured for this product.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map(({ size, stock }) => {
        const isOutOfStock = stock <= 0;
        const isSelected = selected === size;

        return (
          <button
            key={size}
            type="button"
            disabled={isOutOfStock}
            onClick={() => onSelect(size)}
            title={isOutOfStock ? "Unavailable" : `${stock} in stock`}
            className={`min-w-11 rounded-md border px-3 py-1.5 text-sm transition-colors ${
              isOutOfStock
                ? "cursor-not-allowed border-gray-200 text-gray-300 line-through dark:border-gray-800 dark:text-gray-600"
                : isSelected
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-gray-300 text-gray-700 hover:border-indigo-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-400"
            }`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}

export default SizeSelector;
