import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  token: string | null;
  user: any;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (jwt: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const logout = () => {
    console.log("Logging out");
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const login = (jwt: string) => {
    console.log("Logging in with token");
    localStorage.setItem("token", jwt);
    setToken(jwt);
  };

  useEffect(() => {
    const initAuth = () => {
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < now) {
            console.log("Token expired");
            logout();
          } else {
            setUser(payload);
            console.log("User set from token:", payload);
          }
        } catch (err) {
          console.error("Token parsing failed:", err);
          logout();
        }
      }
      setAuthLoading(false);
    };

    initAuth();
  }, [token]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, authLoading, login, logout }} >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
