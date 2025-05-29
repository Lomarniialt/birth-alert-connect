
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/Login/LoginForm';
import Header from '@/components/Layout/Header';
import AdminDashboard from '@/components/Dashboard/AdminDashboard';
import FrontDeskDashboard from '@/components/Dashboard/FrontDeskDashboard';
import LaborNurseDashboard from '@/components/Dashboard/LaborNurseDashboard';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'front_desk':
        return <FrontDeskDashboard />;
      case 'labor_nurse':
        return <LaborNurseDashboard />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Role</h1>
              <p className="text-gray-600">Your account role is not recognized.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {renderDashboard()}
    </div>
  );
};

export default Index;
