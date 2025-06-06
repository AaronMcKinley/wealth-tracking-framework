import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface UserType {
  id: number;
  email: string;
  name: string;
  [key: string]: any;
}

interface AuthContextType {
  token: string | null;
  user: UserType | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (jwt: string) => void;
  logout: () => void;
  setUser: Dispatch<SetStateAction<UserType | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<UserType | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setAuthLoading(false);
    window.location.href = '/';
  };

  const login = (jwt: string) => {
    setUser(null);
    setToken(null);
    setAuthLoading(true);
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
            logout();
          } else {
            setUser(payload);
          }
        } catch (err) {
          logout();
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    };

    initAuth();
  }, [token]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        authLoading,
        login,
        logout,
        setUser,
      }}
    >
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
