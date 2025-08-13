"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setAuthState, logout } from "../store/features/auth/authSlice";
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchProfile = async () => {
        try {
          const profileResponse = await fetch(
            "http://localhost:3001/auth/profile",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (profileResponse.ok) {
            const userProfile = await profileResponse.json();
            dispatch(setAuthState({ user: userProfile, token }));
          } else {
            dispatch(logout());
          }
        } catch (error) {
          console.error("Failed to fetch profile on load:", error);
          dispatch(logout());
        }
      };
      fetchProfile();
    }
  }, [dispatch]);

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
      {/* Left Logo */}
      <div className="flex items-center gap-2">
        <FaProjectDiagram className="text-white drop-shadow-md" size={28} />
        <Link
          href="/dashboard"
          className="text-2xl font-bold text-white hover:text-yellow-300 transition"
        >
          ProjectFlow
        </Link>
      </div>

      {/* Center Search */}
      <div className="flex flex-1 justify-center px-4">
        <div className="flex items-center w-full max-w-md px-4 py-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition cursor-pointer">
          <FaSearch className="text-white opacity-80" />
          <span className="ml-3 text-white opacity-80">Search projects...</span>
        </div>
      </div>

      {/* Right Side */}
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
                <FaUserCircle size={28} className="text-yellow-300" />
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
