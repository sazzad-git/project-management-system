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

  // পেজ লোড হওয়ার সময় অথেনটিকেশন স্টেট চেক করা
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

  // রিডাইরেকশন লজিক
  useEffect(() => {
    if (isCheckDone) {
      // যদি লগইন করা না থাকে এবং সুরক্ষিত পেজে যাওয়ার চেষ্টা করে
      if (!isAuthenticated && !isPublic) {
        router.push('/login');
      }
      // যদি লগইন করা থাকে এবং লগইন/সাইনআপ পেজে যাওয়ার চেষ্টা করে
      if (isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/register')) {
        router.push('/projects');
      }
    }
  }, [isAuthenticated, isCheckDone, isPublic, pathname, router]);

  // --- চূড়ান্ত রেন্ডারিং লজিক ---

  // যদি প্রাথমিক চেক সম্পন্ন না হয়
  if (!isCheckDone) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">Loading...</p></div>;
  }

  // যদি লগইন করা না থাকে এবং সুরক্ষিত পেজে থাকে (রিডাইরেক্ট হওয়ার অপেক্ষায়)
  if (!isAuthenticated && !isPublic) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">Redirecting to Login...</p></div>;
  }

  // যদি লগইন করা থাকে এবং পাবলিক পেজে থাকে (রিডাইরেক্ট হওয়ার অপেক্ষায়)
  if (isAuthenticated && isPublic && pathname !== '/') {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">Redirecting to Projects...</p></div>;
  }
  
  // অন্য সব সঠিক পরিস্থিতিতে (যেমন, হোমপেজ দেখা, সুরক্ষিত পেজ দেখা) children রেন্ডার করুন
  return <>{children}</>;
};

export default AuthWrapper;