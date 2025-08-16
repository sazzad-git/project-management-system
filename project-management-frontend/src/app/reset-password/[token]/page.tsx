"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation'; 
import Link from 'next/link';


const ResetPasswordPage = () => { 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  
  const params = useParams();
  const token = params.token as string; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    setMessage(null);
    setError(null);

    try {
      
      const response = await fetch(`http://localhost:3001/auth/reset-password/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password. The link may have expired.');
      }

      setMessage('Your password has been reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 3000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Reset Your Password
        </h1>
        
        {message && (
          <p className="mb-4 text-sm text-green-600 bg-green-100 p-3 rounded text-center">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded text-center">
            {error}
          </p>
        )}

        {!message && ( 
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                placeholder="Re-enter your new password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition duration-200"
            >
              Reset Password
            </button>
          </form>
        )}
        
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;