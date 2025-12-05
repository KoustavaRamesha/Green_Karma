import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full p-1 transition-colors duration-300 ${
        isDark
          ? "bg-slate-700"
          : "bg-gradient-to-r from-amber-200 to-yellow-300"
      } ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Track icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <Sun
          className={`w-4 h-4 transition-opacity ${
            isDark ? "opacity-30 text-gray-500" : "opacity-100 text-amber-600"
          }`}
        />
        <Moon
          className={`w-4 h-4 transition-opacity ${
            isDark ? "opacity-100 text-blue-300" : "opacity-30 text-gray-400"
          }`}
        />
      </div>

      {/* Thumb */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`w-5 h-5 rounded-full shadow-md flex items-center justify-center ${
          isDark ? "bg-slate-900 ml-auto" : "bg-white ml-0"
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-blue-300" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
