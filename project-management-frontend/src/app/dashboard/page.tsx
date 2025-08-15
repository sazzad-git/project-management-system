"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DashboardRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    // এই পেজে আসা মাত্রই ব্যবহারকারীকে /projects পেজে পাঠিয়ে দিন
    router.replace('/projects');
  }, [router]);

  // রিডাইরেক্ট হওয়ার সময় একটি লোডিং মেসেজ দেখানো ভালো
  return <div>Redirecting to your projects...</div>;
};

export default DashboardRedirectPage;