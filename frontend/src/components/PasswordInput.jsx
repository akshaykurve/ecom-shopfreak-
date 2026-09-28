import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Drop-in replacement for <input type="password">, plus a show/hide toggle.
// All other props (name, value, onChange, required, placeholder, ...) pass through.
function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={`w-full ${className}`}
        // Inline style (not a pr-* class) so it always wins over whatever
        // right-padding utility is in `className`, regardless of Tailwind's
        // generated CSS order - the icon button needs guaranteed clearance.
        style={{ paddingRight: "2.5rem" }}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      >
        {visible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  );
}

export default PasswordInput;
