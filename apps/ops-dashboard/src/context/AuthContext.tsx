import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface User {
  email: string;
  roles: string[];
  token?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'phishsentry.auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
      } catch (error) {
        console.warn('Unable to parse stored auth payload', error);
      }
    } else if (import.meta.env.VITE_DEFAULT_USER_EMAIL) {
      setUser({
        email: import.meta.env.VITE_DEFAULT_USER_EMAIL,
        roles: (import.meta.env.VITE_DEFAULT_USER_ROLES ?? 'analyst').split(',')
      });
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, token?: string) => {
    const newUser: User = { email, roles: ['analyst'], token };
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
