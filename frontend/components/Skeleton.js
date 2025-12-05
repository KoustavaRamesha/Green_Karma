import { motion } from "framer-motion";

// Base skeleton component with shimmer effect
export function Skeleton({ className = "", rounded = "rounded-lg" }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 dark:bg-slate-700 ${rounded} ${className}`}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"
        animate={{ translateX: ["100%", "-100%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

// Text skeleton
export function SkeletonText({ lines = 1, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

// Avatar skeleton
export function SkeletonAvatar({ size = "md" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };
  return <Skeleton className={sizes[size]} rounded="rounded-full" />;
}

// Card skeleton
export function SkeletonCard({ hasImage = false, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 ${className}`}
    >
      {hasImage && (
        <Skeleton className="w-full h-40 mb-4" rounded="rounded-xl" />
      )}
      <div className="flex items-start gap-4">
        <SkeletonAvatar />
        <div className="flex-1">
          <Skeleton className="h-5 w-1/2 mb-2" />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  );
}

// Stat card skeleton
export function SkeletonStatCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="w-12 h-12" rounded="rounded-xl" />
      </div>
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 4 }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-slate-700">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${
            i === 0 ? "w-12" : i === columns - 1 ? "w-20" : "flex-1"
          }`}
        />
      ))}
    </div>
  );
}

// List item skeleton
export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-4">
      <SkeletonAvatar size="md" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16" rounded="rounded-full" />
    </div>
  );
}

// Dashboard loading skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" rounded="rounded-xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard className="h-80" />
        </div>
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonListItem key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Rewards page skeleton
export function RewardsSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Balance Card */}
      <Skeleton className="h-40 w-full" rounded="rounded-2xl" />

      {/* Filters */}
      <div className="flex gap-4">
        <Skeleton className="h-12 w-64" rounded="rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24" rounded="rounded-xl" />
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonCard key={i} hasImage className="h-72" />
        ))}
      </div>
    </div>
  );
}

// History list skeleton
export function HistorySkeleton({ rows = 5 }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="divide-y divide-gray-100 dark:divide-slate-700">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </div>
  );
}
