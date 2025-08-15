"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { logout } from "../store/features/auth/authSlice";
import Image from "next/image";
import {
  FaUserCircle,
  FaBell,
  FaSearch,
  FaProjectDiagram,
} from "react-icons/fa";

const Header = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
    router.push("/login");
  };

  useEffect(() => {
    const closeDropdown = () => setIsDropdownOpen(false);
    if (isDropdownOpen) {
      window.addEventListener("click", closeDropdown);
    }
    return () => window.removeEventListener("click", closeDropdown);
  }, [isDropdownOpen]);

  // সার্চ সাবমিট করার জন্য হ্যান্ডলার (আপডেটেড টাইপ সহ)
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // এই লাইনটি পেজ রিলোড হওয়া প্রতিরোধ করে
    e.preventDefault(); 
    
    if (!searchTerm.trim()) {
      return; // যদি ইনপুট খালি থাকে, তাহলে কিছু করবে না
    }

    console.log("Searching for:", searchTerm);
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
      {/* বাম অংশ (অপরিবর্তিত) */}
      <div className="flex items-center gap-2">
        <FaProjectDiagram className="text-white drop-shadow-md" size={28} />
        <Link
          href="/projects"
          className="text-2xl font-bold text-white hover:text-yellow-300 transition"
        >
          ProjectFlow
        </Link>
      </div>

      {/* মধ্যম অংশ (আপডেটেড) */}
      <div className="flex flex-1 justify-center px-4">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center w-full max-w-md px-4 py-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition"
        >
          <FaSearch className="text-white opacity-80" />
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full ml-3 bg-transparent border-none text-white placeholder:text-white placeholder:opacity-80 focus:outline-none focus:ring-0"
          />
          {/* নির্ভরযোগ্য 'Enter' সাবমিশনের জন্য একটি অদৃশ্য বাটন */}
          <button type="submit" className="hidden" aria-hidden="true"></button>
        </form>
      </div>

      {/* ডান অংশ (অপরিবর্তিত) */}
      <div className="flex items-center gap-5">
        {isAuthenticated ? (
          <>
            <FaBell
              size={22}
              className="cursor-pointer text-white hover:text-yellow-300 transition"
            />
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer text-white hover:text-yellow-300 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                {user?.profileImage ? (
                  <div className="relative w-8 h-8">
                    <Image
                      src={user.profileImage}
                      alt="User Avatar"
                      layout="fill"
                      className="rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <FaUserCircle size={28} className="text-yellow-300" />
                )}
                
                <span className="font-medium">{user?.name || "Guest"}</span>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 font-semibold text-blue-600 bg-white rounded-full hover:bg-gray-100 transition"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;