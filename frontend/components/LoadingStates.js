import { motion } from "framer-motion";

// Full page loading spinner
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium">Loading...</p>
      </motion.div>
    </div>
  );
}

// Inline loading spinner (for buttons, etc)
export function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <div
      className={`${sizes[size]} border-white/30 border-t-white rounded-full animate-spin ${className}`}
    ></div>
  );
}

// Skeleton loading placeholder
export function Skeleton({ className = "", variant = "text" }) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";

  const variants = {
    text: "h-4 w-full",
    title: "h-8 w-3/4",
    avatar: "h-12 w-12 rounded-full",
    thumbnail: "h-32 w-full rounded-xl",
    card: "h-48 w-full rounded-2xl",
    button: "h-10 w-24 rounded-lg",
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}></div>
  );
}

// Card skeleton for dashboard
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="avatar" className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton variant="title" className="mb-2" />
      <Skeleton className="w-1/2" />
    </div>
  );
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-white/30 rounded-xl"></div>
        <div className="w-6 h-6 bg-white/30 rounded"></div>
      </div>
      <div className="h-8 w-24 bg-white/30 rounded mb-2"></div>
      <div className="h-4 w-20 bg-white/30 rounded"></div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }) {
  return (
    <tr className="border-b border-gray-50">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className={i === 0 ? "w-32" : "w-20"} />
        </td>
      ))}
    </tr>
  );
}

// List item skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
      <Skeleton variant="avatar" />
      <div className="flex-1">
        <Skeleton className="w-2/3 mb-2" />
        <Skeleton className="w-1/2 h-3" />
      </div>
      <Skeleton variant="button" />
    </div>
  );
}

// Progress bar with animation
export function AnimatedProgress({ value = 0, max = 100, className = "" }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div
      className={`h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
      />
    </div>
  );
}

// Pulse dot indicator
export function PulseDot({ color = "emerald" }) {
  const colors = {
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
  };

  return (
    <span className="relative flex h-3 w-3">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[color]} opacity-75`}
      ></span>
      <span
        className={`relative inline-flex rounded-full h-3 w-3 ${colors[color]}`}
      ></span>
    </span>
  );
}

// Animated counter
export function AnimatedCounter({ value, duration = 1 }) {
  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={value}>
      <motion.span
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: duration * 0.3 }}
      >
        {value}
      </motion.span>
    </motion.span>
  );
}

// Fade in wrapper for page transitions
export function FadeIn({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation wrapper
export function StaggerChildren({ children, className = "" }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger item (use inside StaggerChildren)
export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Empty state component
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-6"
    >
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </motion.div>
  );
}

// Success animation (checkmark)
export function SuccessAnimation({ size = 64 }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="inline-flex items-center justify-center"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.circle
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
          cx="32"
          cy="32"
          r="28"
          stroke="#10b981"
          strokeWidth="4"
          fill="none"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          d="M20 32L28 40L44 24"
          stroke="#10b981"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}
