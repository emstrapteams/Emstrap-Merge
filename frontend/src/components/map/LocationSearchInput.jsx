import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Search, MapPin, Loader2, X } from "lucide-react";

export default function LocationSearchInput({
  label,
  placeholder = "Search location...",
  value,
  onSelect,
  hideCurrentLocation = false,
}) {
  const [query, setQuery] = useState(value?.address || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  /* keep input synced */
  useEffect(() => {
    setQuery(value?.address || "");
  }, [value]);

  /* outside click close */
  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /* ---------------- SEARCH ---------------- */
  async function searchLocation(text) {
    if (!text.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          text
        )}&countrycodes=in&addressdetails=1&limit=8`,
        { signal: controller.signal }
      );

      const data = await res.json();

      setResults(data || []);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (err) {
      if (err.name !== "AbortError") {
        toast.error("Unable to search location");
      }
    } finally {
      setLoading(false);
    }
  }

  /* debounce input */
  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      searchLocation(val);
    }, 350);
  }

  function chooseLocation(item) {
    if (!item) return;

    const location = {
      address: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
    };

    setQuery(location.address);
    setShowResults(false);
    setResults([]);
    setSelectedIndex(-1);

    onSelect?.(location);
  }

  /* current location */
  async function getCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

          const data = await res.json();

          const location = {
            address: data.display_name,
            lat,
            lng,
          };

          setQuery(location.address);
          setShowResults(false);
          onSelect?.(location);
        } catch {
          toast.error("Unable to fetch address");
        }
      },
      () => toast.error("Location permission denied"),
      { enableHighAccuracy: true }
    );
  }

  /* keyboard control */
  function handleKeyDown(e) {
    if (!showResults || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((p) => Math.min(p + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((p) => Math.max(p - 1, 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        chooseLocation(results[selectedIndex]);
      }
    }

    if (e.key === "Escape") {
      setShowResults(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">

      {label && (
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={query}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length && setShowResults(true)}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 pl-11 pr-24 outline-none focus:ring-2 focus:ring-red-500 transition"
        />

        {loading && (
          <Loader2
            size={18}
            className="absolute right-16 top-1/2 -translate-y-1/2 animate-spin text-red-500"
          />
        )}

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowResults(false);
              setSelectedIndex(-1);
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
          >
            <X size={18} />
          </button>
        )}

        {!hideCurrentLocation && (
          <button
            type="button"
            onClick={getCurrentLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 hover:scale-110 transition"
          >
            <MapPin size={20} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto">

          {results.length === 0 && !loading && (
            <div className="p-4 text-center text-gray-500">
              No locations found
            </div>
          )}

          {results.map((item, index) => (
            <button
              key={item.place_id}
              onClick={() => chooseLocation(item)}
              className={`w-full text-left px-4 py-3 transition border-b border-gray-100 dark:border-gray-700 ${
                selectedIndex === index
                  ? "bg-red-50 dark:bg-red-900/30"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex items-start gap-3">

                <MapPin size={18} className="text-red-500 mt-1 shrink-0" />

                <div>
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {item.display_name.split(",")[0]}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {item.display_name}
                  </div>
                </div>

              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}