"use client"; // এই পেজে ইন্টারেক্টিভিটি এবং স্টেট আছে, তাই এটি একটি ক্লায়েন্ট কম্পোনেন্ট

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Next.js 13+ এর জন্য
import Link from 'next/link';

const SignupPage = () => {
  // ফর্মের ইনপুটগুলোর জন্য স্টেট
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // এরর এবং সফলতার মেসেজ দেখানোর জন্য স্টেট
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  // ফর্ম সাবমিট করার জন্য হ্যান্ডলার ফাংশন
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // পেজ রিলোড হওয়া থেকে বিরত রাখে
    setError(null);     // পুরনো এরর মেসেজ মুছে ফেলে
    setSuccess(null);   // পুরনো সফলতার মেসেজ মুছে ফেলে

    try {
      const response = await fetch('http://localhost:3001/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      // যদি সার্ভার কোনো এরর রেসপন্স পাঠায় (যেমন, ইমেইল আগে থেকেই আছে)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed. Please try again.');
      }

      // সাইন-আপ সফল হলে
      setSuccess('Signup successful! Redirecting to login page...');
      
      // সফলতার পর ফর্মটি রিসেট করুন
      setName('');
      setEmail('');
      setPassword('');

      // ২ সেকেন্ড পর লগইন পেজে রিডাইরেক্ট করুন
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      // নেটওয়ার্ক এরর বা সার্ভার থেকে আসা এরর এখানে ধরা হবে
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>
          Create Account
        </button>
      </form>

      {/* এরর বা সফলতার মেসেজ দেখানোর জন্য */}
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '15px' }}>{success}</p>}

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#0070f3' }}>
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;