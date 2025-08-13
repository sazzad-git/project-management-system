"use client";

import { useState } from "react";
import Link from "next/link";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:3001/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }
      
      // ডেভেলপমেন্টের জন্য, আমরা ব্যাকএন্ড থেকে আসা টোকেনটি কনসোলে দেখাতে পারি
      // console.log("Reset Token:", data.resetToken); // এই লাইনটি শুধুমাত্র পরীক্ষার জন্য

      setMessage("If an account with that email exists, a password reset link has been sent.");
      setEmail(""); // ইনপুট ফিল্ড খালি করে দিন

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-4">
          Forgot Password
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your email and we'll send you instructions to reset your password.
        </p>
        
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

        {!message && ( // যদি সফলতার মেসেজ না থাকে, তাহলেই ফর্ম দেখান
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition duration-200"
            >
              Send Reset Instructions
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;