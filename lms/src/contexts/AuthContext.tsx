import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { getAdmin, getStudents, getTeachers, mockUsers } from '../services/mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
        setUserRole(parsedUser.role);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call to authenticate
    // For this demo, we'll just check if the email exists in our mock data
    // and assume the password is correct
    
    // Find the user with the provided email
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return false;
    }

    // Get the full user data based on role
    let fullUser: User | null = null;
    
    if (user.role === UserRole.ADMIN) {
      fullUser = getAdmin() || null;
    } else if (user.role === UserRole.TEACHER) {
      fullUser = getTeachers().find(t => t.id === user.id) || null;
    } else if (user.role === UserRole.STUDENT) {
      fullUser = getStudents().find(s => s.id === user.id) || null;
    }

    if (fullUser) {
      setCurrentUser(fullUser);
      setIsAuthenticated(true);
      setUserRole(fullUser.role);
      
      // Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(fullUser));
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 