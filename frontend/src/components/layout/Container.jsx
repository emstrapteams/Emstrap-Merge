export default function Container({
  children,
  size = "xl",
  fullWidth = false,
  className = "",
}) {
  const sizes = {
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
  };

  return (
    <div
      className={`
        mx-auto px-4 sm:px-6 lg:px-8
        ${fullWidth ? "max-w-full" : sizes[size]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}