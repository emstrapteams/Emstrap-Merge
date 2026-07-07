export default function AdminSurface({
  children,
  className = "",
  variant = "default", // 🔥 NEW: default | emergency | map
  pulse = false,       // 🔥 NEW: live update effect
  ...props
}) {
  const base =
    "rounded-3xl shadow-xl border transition-all";

  const variants = {
    default:
      "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700",

    emergency:
      "bg-red-50 dark:bg-red-900/10 border-red-500/40 shadow-red-200/30 dark:shadow-none",

    map:
      "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
  };

  return (
    <div
      className={`
        ${base}
        ${variants[variant] || variants.default}
        ${pulse ? "animate-pulse" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}