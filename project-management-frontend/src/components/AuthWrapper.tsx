"use client";

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { RootState, AppDispatch } from '../store/store';
import { setAuthState, logout } from '../store/features/auth/authSlice';

const publicRoutes = ['/', '/login', '/signup', '/forgot-password'];

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, status: authStatus } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // শুধুমাত্র যদি প্রাথমিক চেকটি এখনও না হয়ে থাকে (status === 'idle')
    if (authStatus === 'idle') {
      const token = localStorage.getItem('token');
      if (token) {
        const fetchProfile = async () => {
          try {
            const profileResponse = await fetch('http://localhost:3001/auth/profile', {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (profileResponse.ok) {
              const userProfile = await profileResponse.json();
              dispatch(setAuthState({ user: userProfile, token }));
            } else {
              dispatch(logout()); // টোকেন ভ্যালিড না হলে লগআউট
            }
          } catch (error) {
            dispatch(logout()); // API কলে এরর হলে লগআউট
          }
        };
        fetchProfile();
      } else {
        // যদি টোকেন না থাকে, তাহলে লগআউট স্টেট ডিসপ্যাচ করে চেকটি সম্পন্ন করুন
        dispatch(logout());
      }
    }
  }, [authStatus, dispatch]);
  
  // রিডাইরেকশনের জন্য দ্বিতীয় useEffect
  useEffect(() => {
    // শুধুমাত্র যদি চেক সম্পন্ন হয়
    if (authStatus === 'succeeded' || authStatus === 'failed') {
      const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/reset-password/');

      if (!isAuthenticated && !isPublic) {
        router.push('/login');
      }
      if (isAuthenticated && isPublic && pathname !== '/') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, authStatus, pathname, router]);

  // --- চূড়ান্ত রেন্ডারিং লজিক ---

  // যদি প্রাথমিক অথেনটিকেশন চেক সম্পন্ন না হয়, তাহলে একটি গ্লোবাল লোডার দেখান
  if (authStatus === 'idle' || authStatus === 'loading') {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">Loading Application...</p></div>;
  }
  
  // এখন কন্টেন্ট দেখানোর পালা
  return <>{children}</>;
};

export default AuthWrapper;