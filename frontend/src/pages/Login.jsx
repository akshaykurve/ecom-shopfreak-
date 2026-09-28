import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router";
import { toast } from "react-toastify";
import { loginUser } from "../features/auth/authSlice";
import PasswordInput from "../components/PasswordInput";

const inputClass =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state) => state.auth.status);

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm items-center">
      <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Log in</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Works for both buyer and seller accounts — your account type was set at sign-up.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {status === "loading" ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
