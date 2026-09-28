import { FiImage } from "react-icons/fi";

// Fills its parent (parent controls size/aspect ratio). Falls back to a
// generic image icon when the seller hasn't added a product image.
function ProductImage({ src, alt, className = "", iconSize = 28 }) {
  if (!src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600 ${className}`}
      >
        <FiImage size={iconSize} />
      </div>
    );
  }

  return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />;
}

export default ProductImage;
