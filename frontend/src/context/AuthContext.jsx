import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import API from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  /* ===============================
     LOAD SESSION (AUTO LOGIN CHECK)
  ================================= */
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");

      if (!token) {
        setUser(null);
        setAuthReady(true);
        return null;
      }

      API.defaults.headers.common.Authorization = `Bearer ${token}`;

      const res = await API.get("/auth/me");

      const currentUser = res.data?.user || res.data;

      setUser(currentUser);
      setAuthReady(true);

      return currentUser;
    } catch (err) {
      console.log("Auth session invalid / expired");

      localStorage.removeItem("authToken");
      delete API.defaults.headers.common.Authorization;

      setUser(null);
      setAuthReady(true);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     INIT ONCE
  ================================= */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /* ===============================
     LOGIN
  ================================= */
  const loginUser = useCallback((data) => {
    const token = data?.token;
    const userData = data?.user;

    if (token) {
      localStorage.setItem("authToken", token);
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    setUser(userData || null);
    setAuthReady(true);
  }, []);

  /* ===============================
     LOGOUT
  ================================= */
  const logoutUser = useCallback(async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.log("Logout error:", err.message);
    }

    localStorage.removeItem("authToken");
    delete API.defaults.headers.common.Authorization;

    setUser(null);
    setAuthReady(true);
  }, []);

  /* ===============================
     ROLE HELPERS (STANDARDIZED)
  ================================= */
  const roles = useMemo(() => {
    const role = user?.role?.toLowerCase();

    return {
      isAdmin: role === "admin",
      isUser: role === "user",
      isPolice: role === "police",
      isHospital: role === "hospital",
      isAmbulance: role === "ambulance",
      isDispatcher: role === "dispatcher",
    };
  }, [user]);

  /* ===============================
     CONTEXT VALUE
  ================================= */
  const value = useMemo(
    () => ({
      user,
      loading,
      authReady,

      loginUser,
      logoutUser,
      refreshUser,
      setUser,

      ...roles,
    }),
    [user, loading, authReady, loginUser, logoutUser, refreshUser, roles]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}