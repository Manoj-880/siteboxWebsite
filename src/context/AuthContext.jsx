import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/axiosConfig';
import { getDefaultPath, ROLE_IDS, hasRole } from '../constants/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('sitex_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!!localStorage.getItem('sitex_token'));

  useEffect(() => {
    const token = localStorage.getItem('sitex_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.profile()
      .then((res) => {
        if (res.data?.data?.user) setUser(res.data.data.user);
      })
      .catch(() => {
        localStorage.removeItem('sitex_token');
        localStorage.removeItem('sitex_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (mobile, password) =>
    authApi.login(mobile, password).then((res) => {
      const { token, user: u } = res.data.data;
      localStorage.setItem('sitex_token', token);
      localStorage.setItem('sitex_user', JSON.stringify(u));
      setUser(u);
      return res.data;
    });

  const updateUser = (nextUser) => {
    setUser(nextUser);
    try {
      localStorage.setItem('sitex_user', JSON.stringify(nextUser));
    } catch (_) {}
  };

  const logout = () => {
    localStorage.removeItem('sitex_token');
    localStorage.removeItem('sitex_user');
    setUser(null);
  };

  const roleId = user?.user_role_id ?? null;
  const defaultPath = getDefaultPath(user);
  const isSuperAdmin = hasRole(user, ROLE_IDS.SUPER_ADMIN);
  const isAdmin = hasRole(user, ROLE_IDS.ADMIN) || isSuperAdmin;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateUser,
      roleId,
      defaultPath,
      isSuperAdmin,
      isAdmin,
      hasRole: (idOrName) => hasRole(user, idOrName),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
