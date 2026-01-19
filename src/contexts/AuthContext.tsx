import { createContext, useContext, useState, ReactNode } from 'react';

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
  register: (name: string, email: string, password: string, phone: string, role: string) => Promise<void>;
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

  const login = async (email: string, _password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user based on email for demo purposes
    let mockUser: User;
    if (email.includes('admin')) {
      mockUser = {
        id: '1',
        name: 'Uditha Sandeepa',
        email,
        phone: '+94 77 123 4567',
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
      };
    } else if (email.includes('coach')) {
      mockUser = {
        id: '2',
        name: 'Ravindra Pushpakumara',
        email,
        phone: '+94 71 234 5678',
        role: 'coach',
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400'
      };
    } else if (email.includes('player')) {
      mockUser = {
        id: '3',
        name: 'Sumith Ranasinghe',
        email,
        phone: '+94 76 345 6789',
        role: 'player',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400'
      };
    } else {
      mockUser = {
        id: '4',
        name: 'Amil Gunaratne',
        email,
        phone: '+94 75 456 7890',
        role: 'guest'
      };
    }
    
    setUser(mockUser);
  };

  const register = async (name: string, email: string, _password: string, phone: string, role: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      role: role as User['role']
    };
    
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const loginGuest = async (name: string, email: string, phone: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser({
      id: 'guest',
      name,
      email,
      phone,
      role: 'guest'
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loginGuest }}>
      {children}
    </AuthContext.Provider>
  );
}