
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Admin',
    email: 'admin@hospital.com',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Mary Johnson',
    email: 'frontdesk@hospital.com',
    role: 'front_desk',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Nurse Lisa Brown',
    email: 'nurse1@hospital.com',
    role: 'labor_nurse',
    laborRoomId: 'room1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Nurse Carol White',
    email: 'nurse2@hospital.com',
    role: 'labor_nurse',
    laborRoomId: 'room2',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('hospitalUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any password for existing users
    const foundUser = mockUsers.find(u => u.email === email && u.isActive);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('hospitalUser', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hospitalUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
