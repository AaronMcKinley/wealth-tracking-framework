import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';

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

// Create authentication context
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UserType | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Clear auth state and redirect to home
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthLoading(false);
    window.location.href = '/';
  };

  // Decode JWT payload and validate before setting user
  const decodeAndSetUser = (jwt: string): boolean => {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) throw new Error('Token expired');
      setUser({
        id: payload.userId || payload.id,
        email: payload.email,
        name: payload.name,
        ...payload,
      });
      return true;
    } catch (err) {
      console.warn('Client JWT decode failed:', err);
      return false;
    }
  };

  // Save token and initialize user session
  const login = (jwt: string) => {
    localStorage.setItem('token', jwt);
    setToken(jwt);
    const valid = decodeAndSetUser(jwt);
    if (!valid) logout();
    else setAuthLoading(false);
  };

  // Re-check token validity on mount or token change
  useEffect(() => {
    if (token) {
      const valid = decodeAndSetUser(token);
      if (!valid) logout();
      else setAuthLoading(false);
    } else {
      setUser(null);
      setAuthLoading(false);
    }
  }, [token]);

  const isAuthenticated = !!token && !!user;

  return (
    // Provide authentication state and actions via context
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

// Hook to consume AuthContext safely
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
