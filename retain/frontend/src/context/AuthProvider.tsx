import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loginRequest, meRequest, registerRequest } from '../api/auth';
import { TOKEN_KEY, UNAUTHORIZED_EVENT } from '../api/client';
import type { AuthResponse, User } from '../types';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => localStorage.getItem(TOKEN_KEY) !== null);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // Restore the session from a saved token on first load.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    meRequest()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  // The API client fires this when a token expires or is rejected.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const startSession = useCallback(({ token, user: signedIn }: AuthResponse): User => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(signedIn);
    return signedIn;
  }, []);

  const login = useCallback(async (email: string, password: string) => startSession(await loginRequest(email, password)), [startSession]);
  const register = useCallback(
    async (name: string, email: string, password: string) => startSession(await registerRequest(name, email, password)),
    [startSession]
  );

  const value = useMemo<AuthContextValue>(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
