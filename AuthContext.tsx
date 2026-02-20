import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
  }, []);

  const login = useCallback((userData: User) => {
    // Map _id to studentId if not present, ensuring the ID (e.g., LSV-0001) is available
    const userToSave = {
      ...userData,
      studentId: userData.studentId || userData._id
    };

    setIsAuthenticated(true);
    setUser(userToSave);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userToSave));
    localStorage.setItem('lastActivity', Date.now().toString());
  }, []);

  // 15 Minute Inactivity Timeout
  useEffect(() => {
    if (!isAuthenticated) return;

    const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

    const checkActivity = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const now = Date.now();
        if (now - parseInt(lastActivity, 10) > TIMEOUT_MS) {
          logout();
        }
      }
    };

    const updateActivity = () => {
      if (isAuthenticated) {
        localStorage.setItem('lastActivity', Date.now().toString());
      }
    };

    const intervalId = setInterval(checkActivity, 60 * 1000); // Check every minute
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [isAuthenticated, logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};