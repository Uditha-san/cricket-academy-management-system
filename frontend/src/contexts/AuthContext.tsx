import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'guest' | 'player' | 'coach' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, role: string, adminCode?: string, dateOfBirth?: string, preferredPosition?: string, battingStyle?: string, bowlingStyle?: string, address?: string, emergencyContact?: string) => Promise<void>;
  logout: () => void;
  loginGuest: (name: string, email: string, phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const register = async (name: string, email: string, password: string, phone: string, role: string, adminCode?: string, dateOfBirth?: string, preferredPosition?: string, battingStyle?: string, bowlingStyle?: string, address?: string, emergencyContact?: string) => {
    await api.post('/auth/register', { name, email, password, phone, role, adminCode, dateOfBirth, preferredPosition, battingStyle, bowlingStyle, address, emergencyContact });
    // Do not log in automatically. User must verify email.
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const loginGuest = async (name: string, email: string, phone: string) => {
    const response = await api.post('/auth/guest-login', { name, email, phone });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loginGuest }}>
      {children}
    </AuthContext.Provider>
  );
}