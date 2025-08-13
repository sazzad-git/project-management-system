"use client"; // <--- এই লাইনটিই সমাধান! এটিকে ফাইলের একদম উপরে যোগ করুন।

import { useState } from 'react';
import { useDispatch } from 'react-redux'; // নিশ্চিত করুন যে এটি ইম্পোর্ট করা আছে
import { useRouter } from 'next/navigation'; // Next 13+ এর জন্য useRouter
import { loginSuccess } from '../../store/features/auth/authSlice'; // আপনার authSlice থেকে

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch(); // এখন এটি সঠিকভাবে কাজ করবে
  const router = useRouter();

  // src/app/login/page.tsx

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  try {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    const token = data.access_token;
    localStorage.setItem('token', token);
    
    // --- সমাধানটি এখানে ---
    // টোকেন ব্যবহার করে প্রোফাইল তথ্য আনুন
    const profileResponse = await fetch('http://localhost:3001/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Could not fetch user profile after login');
    }

    const userProfile = await profileResponse.json();

    // এখন সম্পূর্ণ ইউজার তথ্য দিয়ে Redux স্টোর আপডেট করুন
    dispatch(loginSuccess({ token: token, user: userProfile }));

    router.push('/dashboard');
  } catch (err: any) {
    setError(err.message);
  }
};

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;