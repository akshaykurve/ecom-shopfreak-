import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { logoutUser } from "../features/auth/authSlice";
import { resetCart } from "../features/cart/cartSlice";
import ThemeToggle from "./ThemeToggle";

// Small pill showing which kind of account is logged in, so it's never
// ambiguous whether you're browsing as a buyer or managing as a seller.
function RoleBadge({ role }) {
  const isSeller = role === "seller";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        isSeller
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      }`}
    >
      {isSeller ? "Seller" : "Buyer"}
    </span>
  );
}

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart.cart);

  const [menuOpen, setMenuOpen] = useState(false);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = async () => {
    setMenuOpen(false);
    await dispatch(logoutUser());
    dispatch(resetCart());
    toast.success("Logged out");
    navigate("/login");
  };

  const linkClass =
    "text-sm text-gray-700 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400";

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400"
        >
          ShopFreak
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className={linkClass}>
            Shop
          </Link>

          {user?.role === "seller" && (
            <Link to="/seller/dashboard" className={linkClass}>
              Dashboard
            </Link>
          )}

          <ThemeToggle />

          {user && (
            <Link to="/cart" className="relative text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
              <FiShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                <span>Hi, {user.name.split(" ")[0]}</span>
                <RoleBadge role={user.role} />
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className={linkClass}>
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-indigo-500"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />

          {user && (
            <Link to="/cart" className="relative p-2 text-gray-700 dark:text-gray-300">
              <FiShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            className="p-2 text-gray-700 dark:text-gray-300"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-gray-200 bg-white px-4 py-3 md:hidden dark:border-gray-800 dark:bg-gray-950">
          <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900">
            Shop
          </Link>

          {user?.role === "seller" && (
            <Link
              to="/seller/dashboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <>
              <div className="flex items-center gap-1.5 px-2 py-2 text-sm text-gray-700 dark:text-gray-300">
                <span>Hi, {user.name.split(" ")[0]}</span>
                <RoleBadge role={user.role} />
              </div>
              <button
                onClick={handleLogout}
                className="mt-1 rounded-md bg-gray-900 px-3 py-2 text-left text-sm text-white dark:bg-gray-100 dark:text-gray-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm text-white hover:bg-indigo-500"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
