import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router";
import { toast } from "react-toastify";
import { FiShoppingBag, FiBriefcase } from "react-icons/fi";
import { registerUser } from "../features/auth/authSlice";
import PasswordInput from "../components/PasswordInput";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "buyer",
};

const inputClass =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state) => state.auth.status);

  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectRole = (role) => setForm({ ...form, role });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created, please log in");
      navigate("/login");
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm items-center py-6">
      <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create an account</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          One account type per sign-up — pick how you'll use ShopFreak below.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              I'm signing up to...
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => selectRole("buyer")}
                aria-pressed={form.role === "buyer"}
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-center transition-colors ${
                  form.role === "buyer"
                    ? "border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
              >
                <FiShoppingBag
                  size={20}
                  className={form.role === "buyer" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Buyer</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Shop for products</span>
              </button>

              <button
                type="button"
                onClick={() => selectRole("seller")}
                aria-pressed={form.role === "seller"}
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-center transition-colors ${
                  form.role === "seller"
                    ? "border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
              >
                <FiBriefcase
                  size={20}
                  className={form.role === "seller" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Seller</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">List & sell products</span>
              </button>
            </div>
          </fieldset>

          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <PasswordInput
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <PasswordInput
            name="confirmPassword"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className={inputClass}
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {status === "loading" ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
