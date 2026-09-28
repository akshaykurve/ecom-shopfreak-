import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
  } catch {
    // localStorage can throw in private-browsing/blocked-storage contexts
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore - theme just won't persist across visits
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label="Toggle theme"
      title="Toggle theme"
      className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}

export default ThemeToggle;
