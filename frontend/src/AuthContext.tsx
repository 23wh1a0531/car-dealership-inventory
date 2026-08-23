import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  setAuth: (token: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseRole(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? 'USER';
  } catch {
    return 'USER';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(() => {
    const t = localStorage.getItem('token');
    return t ? parseRole(t) : null;
  });

  function setAuth(newToken: string, newRole: string) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setRole(newRole);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setRole(null);
  }

  return <AuthContext.Provider value={{ token, role, setAuth, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
