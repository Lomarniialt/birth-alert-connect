
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Heart } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'front_desk': return 'Front Desk Officer';
      case 'labor_nurse': return 'Labor Room Nurse';
      default: return role;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                MaternityCare System
              </h1>
              <p className="text-sm text-blue-600">
                Childbirth Notification Management
              </p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-blue-600">{getRoleDisplay(user.role)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
