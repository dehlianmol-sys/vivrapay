import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useStore } from '../lib/store';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-[#2b8cff] rounded-full animate-spin" />
    </div>
  );
}

export function RequireUser({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useStore();
  const loc = useLocation();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (currentUser.role !== 'user') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { currentUser, isAdmin, loading } = useStore();
  const loc = useLocation();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { currentUser, isSuperAdmin, loading } = useStore();
  const loc = useLocation();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useStore();
  if (loading) return <LoadingScreen />;
  if (currentUser) {
    return <Navigate to={currentUser.role === 'user' ? '/' : '/admin'} replace />;
  }
  return <>{children}</>;
}
