import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "admin" | "staff" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  barangay: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Restore from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("water_market_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Login via backend API
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await response.json();
      if (data.success) {
        const loggedInUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          barangay: data.user.barangay || "Panalaron",
        };
        setUser(loggedInUser);
        localStorage.setItem("water_market_user", JSON.stringify(loggedInUser));
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("water_market_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
