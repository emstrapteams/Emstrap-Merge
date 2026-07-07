import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";

const EmergencyContext = createContext();

export const useEmergency = () => {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error("useEmergency must be used inside EmergencyProvider");
  return ctx;
};

// -----------------------------
// STORAGE HELPERS
// -----------------------------
const safeParse = (v, fallback = null) => {
  try {
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const KEYS = {
  userLocation: "userLocation",
  driverLocation: "driverLocation",
  emergencyId: "emergencyId",
  status: "emergencyStatus",
  driverName: "driverName",
  vehicle: "vehicle",
  photo: "photo",
  route: "route",
};

// -----------------------------
// PROVIDER
// -----------------------------
export function EmergencyProvider({ children }) {
  const hydrated = useRef(false);

  // 🚑 SINGLE STATE CORE (FAST + CLEAN)
  const [state, setState] = useState(() => ({
    userLocation: safeParse(sessionStorage.getItem(KEYS.userLocation)),
    driverLocation: safeParse(sessionStorage.getItem(KEYS.driverLocation)),
    emergencyId: sessionStorage.getItem(KEYS.emergencyId) || null,
    status: sessionStorage.getItem(KEYS.status) || "PENDING",
    driverName: sessionStorage.getItem(KEYS.driverName) || "",
    vehicle: safeParse(sessionStorage.getItem(KEYS.vehicle)),
    photo: sessionStorage.getItem(KEYS.photo) || null,
    route: safeParse(sessionStorage.getItem(KEYS.route), []),
    lastUpdate: Date.now(),
  }));

  // ⚡ DERIVED VALUES (NO STORAGE)
  const derived = useMemo(() => {
    const active = !!state.emergencyId;
    const ready = !!state.userLocation && !!state.driverLocation;

    return {
      isActive: active,
      isReady: ready,
      distance: ready ? "CALCULATING..." : "--",
      eta: ready ? "CALCULATING..." : "--",
    };
  }, [state.userLocation, state.driverLocation, state.emergencyId]);

  // 💾 SESSION PERSIST (hydration-safe)
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }

    const s = sessionStorage;

    s.setItem(KEYS.userLocation, JSON.stringify(state.userLocation || null));
    s.setItem(KEYS.driverLocation, JSON.stringify(state.driverLocation || null));
    s.setItem(KEYS.emergencyId, state.emergencyId || "");
    s.setItem(KEYS.status, state.status || "PENDING");
    s.setItem(KEYS.driverName, state.driverName || "");
    s.setItem(KEYS.vehicle, JSON.stringify(state.vehicle || null));
    s.setItem(KEYS.photo, state.photo || "");
    s.setItem(KEYS.route, JSON.stringify(state.route || []));
  }, [state]);

  // 🚑 FAST UPDATE ENGINE (EMS CORE)
  const updateEmergency = useCallback((patch = {}) => {
    setState((prev) => {
      let changed = false;

      for (const k in patch) {
        if (prev[k] !== patch[k]) {
          changed = true;
          break;
        }
      }

      if (!changed) return prev;

      return {
        ...prev,
        ...patch,
        lastUpdate: Date.now(),
      };
    });
  }, []);

  // 📡 BATCH UPDATE (socket / GPS safe)
  const batchUpdate = useCallback((updates = []) => {
    setState((prev) => {
      let next = { ...prev };
      let changed = false;

      for (const patch of updates) {
        for (const k in patch) {
          if (next[k] !== patch[k]) {
            next[k] = patch[k];
            changed = true;
          }
        }
      }

      if (!changed) return prev;

      next.lastUpdate = Date.now();
      return next;
    });
  }, []);

  // 🧹 RESET EMS CASE
  const clearEmergency = useCallback(() => {
    sessionStorage.clear();

    setState({
      userLocation: null,
      driverLocation: null,
      emergencyId: null,
      status: "PENDING",
      driverName: "",
      vehicle: null,
      photo: null,
      route: [],
      lastUpdate: Date.now(),
    });
  }, []);

  // ⚡ CONTEXT EXPORT
  const value = useMemo(
    () => ({
      ...state,
      ...derived,

      setState: updateEmergency,
      updateEmergency,
      batchUpdate,
      clearEmergency,
    }),
    [state, derived, updateEmergency, batchUpdate, clearEmergency]
  );

  return (
    <EmergencyContext.Provider value={value}>
      {children}
    </EmergencyContext.Provider>
  );
}