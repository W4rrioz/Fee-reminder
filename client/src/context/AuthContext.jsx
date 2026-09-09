import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'feereminder_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Save or clear token in both state and localStorage
  function saveToken(newToken) {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(newToken);
  }

  // On mount, validate the stored token by calling the backend
  useEffect(() => {
    async function validateToken() {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${stored}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.admin);
        } else {
          // Token is invalid or expired — clear it
          saveToken(null);
          setUser(null);
        }
      } catch {
        // Network error — keep the token but mark as loaded
        // (the user will see errors when they try to do things)
      }
      setLoading(false);
    }

    validateToken();
  }, []);

  /**
   * Sign up a new admin + institute.
   * Calls POST /api/auth/signup on the backend.
   */
  async function signUp({ email, password, instituteName }) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, instituteName }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data };
    }

    saveToken(data.token);
    setUser(data.admin);
    return { data };
  }

  /**
   * Sign in an existing admin.
   * Calls POST /api/auth/signin on the backend.
   */
  async function signIn({ email, password }) {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data };
    }

    saveToken(data.token);
    setUser(data.admin);
    return { data };
  }

  function signOut() {
    saveToken(null);
    setUser(null);
  }

  const getToken = useCallback(() => token, [token]);

  const value = {
    token,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
