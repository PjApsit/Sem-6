import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useUser } from '@/context/UserContext';

export const AppLayout: React.FC = () => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
