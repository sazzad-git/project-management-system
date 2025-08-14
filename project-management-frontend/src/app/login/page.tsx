"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
// loginSuccess-এর পরিবর্তে setAuthState ইম্পোর্ট করুন (অথবা loginSuccess-কেই আপডেট করুন)
import { setAuthState } from "../../store/features/auth/authSlice";
import Link from "next/link";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();
  const router = useRouter(); // যদিও আমরা push ব্যবহার করব না, রাউটার অবজেক্টটি রাখা যেতে পারে

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  try {
    const response = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // ১. রেসপন্স বডি একবার পড়ুন এবং একটি ভেরিয়েবলে সেভ করুন
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    // ২. টোকেন এবং ইউজার প্রোফাইল তথ্য নিন
    const token = data.access_token;
    const userProfile = data.user; // আপনার ব্যাকএন্ড থেকে ইউজার তথ্য আসার কথা

    localStorage.setItem("token", token);
    dispatch(setAuthState({ token: token, user: userProfile }));

  } catch (err: any) {
    setError(err.message);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Login to ProjectFlow
        </h1>
        <form onSubmit={handleLogin} className="space-y-5">
          {/* আপনার ফর্মের বাকি অংশ অপরিবর্তিত থাকবে */}
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
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition duration-200"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;