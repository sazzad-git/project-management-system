"use client";

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { RootState, AppDispatch } from '../store/store';
import { setAuthState, logout, authLoading } from '../store/features/auth/authSlice';

const publicRoutes = ['/', '/login', '/signup', '/register', '/forgot-password'];

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, status: authStatus } = useSelector((state: RootState) => state.auth);

  // Authentication check
  useEffect(() => {
    if (authStatus === 'idle') {
      const token = localStorage.getItem('token');
      if (token) {
        dispatch(authLoading());
        const fetchProfile = async () => {
          try {
            const response = await fetch('http://localhost:3001/auth/profile', {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
              const userProfile = await response.json();
              dispatch(setAuthState({ user: userProfile, token }));
            } else {
              dispatch(logout());
            }
          } catch (error) {
            dispatch(logout());
          }
        };
        fetchProfile();
      } else {
        dispatch(logout());
      }
    }
  }, [authStatus, dispatch]);

  const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/reset-password/');
  const isCheckDone = authStatus === 'succeeded' || authStatus === 'failed';

  // Redirection
  useEffect(() => {
    if (isCheckDone) {
      
      if (!isAuthenticated && !isPublic) {
        router.push('/login');
      }
      
      if (isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/register')) {
        router.push('/projects');
      }
    }
  }, [isAuthenticated, isCheckDone, isPublic, pathname, router]);

  // --- Final rendering ---

  if (!isCheckDone) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">Loading...</p></div>;
  }

 
  if (!isAuthenticated && !isPublic) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">Redirecting to Login...</p></div>;
  }

  
  if (isAuthenticated && isPublic && pathname !== '/') {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">Redirecting to Projects...</p></div>;
  }
  
  
  return <>{children}</>;
};

export default AuthWrapper;