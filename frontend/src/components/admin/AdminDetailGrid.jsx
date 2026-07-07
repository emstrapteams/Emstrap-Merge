import { formatDate } from "./admin.utils";

const IMAGE_FIELDS = [
  "image",
  "photo",
  "license",
  "avatar",
  "profile",
  "imageurl",
  "photourl",
  "licenseimage",
];

/* =========================
   IMAGE DETECTION
========================= */
const isImageField = (label = "") =>
  IMAGE_FIELDS.includes(label.replace(/\s+/g, "").toLowerCase());

const isImageValue = (value) => {
  if (typeof value !== "string") return false;

  return (
    value.startsWith("data:image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value) ||
    value.startsWith("http")
  );
};

/* =========================
   GPS DETECTION (NEW 🔥)
========================= */
const isLocationObject = (value) => {
  return (
    value &&
    typeof value === "object" &&
    "latitude" in value &&
    "longitude" in value
  );
};

/* =========================
   FORMAT VALUE
========================= */
const formatValue = (value) => {
  if (value === null || value === undefined || value === "")
    return "N/A";

  if (typeof value === "boolean") return value;

  if (value instanceof Date) return formatDate(value);

  if (
    typeof value === "string" &&
    !Number.isNaN(Date.parse(value)) &&
    value.includes("-")
  ) {
    return formatDate(value);
  }

  if (Array.isArray(value))
    return value.length
      ? JSON.stringify(value, null, 2)
      : "[]";

  if (typeof value === "object") {
    // 🚑 DO NOT stringify GPS objects
    if (isLocationObject(value)) return value;

    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

/* =========================
   VALUE RENDERER
========================= */
function ValueRenderer({ value, label }) {
  const formatted = formatValue(value);

  /* ================= GPS MAP LINK ================= */
  if (isLocationObject(formatted)) {
    const { latitude, longitude } = formatted;

    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          📍 {latitude}, {longitude}
        </span>

        <a
          href={`https://www.google.com/maps?q=${latitude},${longitude}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 text-sm font-semibold hover:underline"
        >
          Open in Google Maps →
        </a>
      </div>
    );
  }

  /* ================= BOOLEAN ================= */
  if (typeof formatted === "boolean") {
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          formatted
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {formatted ? "Yes" : "No"}
      </span>
    );
  }

  /* ================= DEFAULT ================= */
  return (
    <pre className="whitespace-pre-wrap break-words font-sans text-sm max-h-56 overflow-auto">
      {formatted}
    </pre>
  );
}

/* =========================
   MAIN GRID
========================= */
export default function AdminDetailGrid({ data = {} }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {Object.entries(data).map(([label, value]) => {
        const showImage =
          value &&
          (isImageField(label) || isImageValue(value));

        return (
          <div
            key={label}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-5 transition hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">
              {label}
            </p>

            {showImage ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <img
                  src={value}
                  alt={label}
                  loading="lazy"
                  className="w-full max-h-72 object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.innerHTML = `
                      <div class="p-6 text-center text-sm text-gray-400">
                        Unable to load image
                      </div>`;
                  }}
                />
              </div>
            ) : (
              <ValueRenderer value={value} label={label} />
            )}
          </div>
        );
      })}
    </div>
  );
}