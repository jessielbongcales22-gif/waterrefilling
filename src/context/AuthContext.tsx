import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'admin' | 'staff' | 'customer' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  barangay: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: Role, barangay?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('water_market_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, role: Role, barangay: string = 'Panalaron') => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role,
      barangay,
    };
    setUser(newUser);
    localStorage.setItem('water_market_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('water_market_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
