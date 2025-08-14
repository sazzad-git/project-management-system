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

  useEffect(() => {
    if (authStatus === 'idle') {
      const token = localStorage.getItem('token');
      if (token) {
        dispatch(authLoading());
        const fetchProfile = async () => {
          try {
            const profileResponse = await fetch('http://localhost:3001/auth/profile', {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (profileResponse.ok) {
              const userProfile = await profileResponse.json();
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
  
  // --- নতুন, একত্রিত রিডাইরেকশন এবং রেন্ডারিং লজিক ---

  const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/reset-password/');
  const isCheckDone = authStatus === 'succeeded' || authStatus === 'failed';

  useEffect(() => {
    if (isCheckDone) {
      // যদি লগইন করা না থাকে এবং সুরক্ষিত পেজে যাওয়ার চেষ্টা করে
      if (!isAuthenticated && !isPublic) {
        router.push('/login');
      }
      // যদি লগইন করা থাকে এবং পাবলিক পেজে যাওয়ার চেষ্টা করে (হোমপেজ ছাড়া)
      if (isAuthenticated && isPublic && pathname !== '/') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isCheckDone, isPublic, pathname, router]);


  // যদি প্রাথমিক অথেনটিকেশন চেক সম্পন্ন না হয়, তাহলে লোডার দেখান
  if (!isCheckDone) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">Loading Application...</p></div>;
  }

  // যদি রাউটটি পাবলিক হয় এবং ইউজার লগইন করা নেই, তাহলে পেজটি দেখান
  if (isPublic && !isAuthenticated) {
    return <>{children}</>;
  }

  // যদি রাউটটি সুরক্ষিত হয় এবং ইউজার লগইন করা আছে, তাহলে পেজটি দেখান
  if (!isPublic && isAuthenticated) {
    return <>{children}</>;
  }

  // অন্য সব ক্ষেত্রে (যেমন, রিডাইরেকশনের সময়) একটি লোডার দেখানোই নিরাপদ
  return <div className="flex justify-center items-center h-screen"><p className="text-lg">Redirecting...</p></div>;
};

export default AuthWrapper;