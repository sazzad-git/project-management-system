"use client";

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { RootState } from '../store/store';
import { setAuthState, logout } from '../store/features/auth/authSlice';

// --- পরিবর্তনটি এখানে ---
// এই রাউটগুলো পাবলিক (লগইন ছাড়া অ্যাক্সেস করা যায়)
// হোমপেজ ('/')-কে এই তালিকায় যোগ করুন
const publicRoutes = ['/', '/login', '/register', '/forgot-password'];

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
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
          console.error('Failed to validate token:', error);
          dispatch(logout());
        }
      }
      setIsInitialCheckDone(true);
    };

    // যদি স্টোরে তথ্য না থাকে, তাহলেই শুধু চেক করুন
    if (!isAuthenticated) {
      checkAuth();
    } else {
      setIsInitialCheckDone(true);
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isInitialCheckDone) {
const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/reset-password/');

      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      }

      if (isAuthenticated && isPublicRoute && pathname !== '/') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isInitialCheckDone, pathname, router]);

  // --- নতুন, সহজ রেন্ডারিং লজিক ---
  
  // যদি প্রাথমিক চেক সম্পন্ন না হয়, তাহলে একটি লোডিং UI দেখান
  if (!isInitialCheckDone) {
    return <div>Loading...</div>;
  }

  // যদি রাউটটি পাবলিক হয়, তাহলে children রেন্ডার করার অনুমতি দিন
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // যদি রাউটটি সুরক্ষিত হয় এবং ব্যবহারকারী লগইন করা থাকে, তাহলেও children রেন্ডার করার অনুমতি দিন
  if (!publicRoutes.includes(pathname) && isAuthenticated) {
    return <>{children}</>;
  }

  // অন্যথায়, ব্যবহারকারীকে রিডাইরেক্ট করা হচ্ছে, তাই লোডিং দেখানোই ভালো
  return <div>Loading...</div>;
};

export default AuthWrapper;