import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useUser } from '@/context/UserContext';

export const AppLayout = () => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
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
