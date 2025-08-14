"use client";

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { RootState } from '../store/store';
import { setAuthState, logout } from '../store/features/auth/authSlice';

// এই রাউটগুলো পাবলিক (লগইন ছাড়া অ্যাক্সেস করা যায়)
const publicRoutes = ['/', '/login', '/signup', '/forgot-password'];

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

  // পেজ লোড হওয়ার সময় অথেনটিকেশন স্টেট চেক করার জন্য useEffect
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
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
          console.error('Failed to validate token on load:', error);
          dispatch(logout());
        }
      }
      // টোকেন থাকুক বা না থাকুক, প্রাথমিক চেক সম্পন্ন হয়েছে
      setIsInitialCheckDone(true);
    };

    checkAuthStatus();
  }, [dispatch]); // এই useEffect শুধুমাত্র একবারই চলবে

  // রিডাইরেকশনের জন্য দ্বিতীয় useEffect
  useEffect(() => {
    // শুধুমাত্র যদি প্রাথমিক চেক সম্পন্ন হয়, তাহলেই রিডাইরেকশনের লজিক চালাও
    if (isInitialCheckDone) {
      const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/reset-password/');

      // যদি লগইন করা না থাকে এবং সুরক্ষিত পেজে যাওয়ার চেষ্টা করে
      if (!isAuthenticated && !isPublic) {
        router.push('/login');
      }

      // যদি লগইন করা থাকে এবং কোনো পাবলিক পেজে যাওয়ার চেষ্টা করে (হোমপেজ ছাড়া)
      if (isAuthenticated && isPublic && pathname !== '/') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isInitialCheckDone, pathname, router]);


  // --- চূড়ান্ত এবং সহজ রেন্ডারিং লজিক ---

  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/reset-password/');

  // যদি প্রাথমিক চেক শেষ না হয়, তাহলে একটি লোডিং UI দেখান
  if (!isInitialCheckDone) {
    return <div>Loading...</div>;
  }

  // যদি পেজটি একটি পাবলিক পেজ হয়, তাহলে দেখান
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // যদি পেজটি সুরক্ষিত হয় এবং ব্যবহারকারী লগইন করা থাকে, তাহলে দেখান
  if (!isPublicRoute && isAuthenticated) {
    return <>{children}</>;
  }

  // অন্য সব ক্ষেত্রে (যেমন, সুরক্ষিত পেজে যাওয়ার চেষ্টা করছে কিন্তু এখনো লগইন পেজে রিডাইরেক্ট হয়নি)
  // লোডিং দেখানোই শ্রেয়
  return <div>Loading...</div>;
};

export default AuthWrapper;