import { Link } from "react-router";

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">404</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Page not found</h1>
      <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Back to shop
      </Link>
    </div>
  );
}

export default NotFound;
