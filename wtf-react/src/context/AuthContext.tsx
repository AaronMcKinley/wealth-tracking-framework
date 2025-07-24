import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
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

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token')
  );
  const [user, setUser] = useState<UserType | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthLoading(false);
    window.location.href = '/';
  };

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

  const login = (jwt: string) => {
    localStorage.setItem('token', jwt);
    setToken(jwt);
    const valid = decodeAndSetUser(jwt);
    if (!valid) logout();
    else setAuthLoading(false);
  };

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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
