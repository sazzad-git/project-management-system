"use client";

import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "../store/store";
// import { logout } from "../store/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { FaUserCircle, FaEnvelope, FaIdBadge, FaSignOutAlt } from "react-icons/fa";
import { logout } from "@/store/features/auth/authSlice";

const ProfilePage = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <FaUserCircle className="text-blue-600 text-7xl mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
          <p className="text-gray-600">{user?.role || "Member"}</p>
        </div>

        {/* User Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg">
            <FaEnvelope className="text-gray-500" />
            <span className="text-gray-700">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg">
            <FaIdBadge className="text-gray-500" />
            <span className="text-gray-700">{user?.role || "Member"}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition duration-200 flex items-center justify-center gap-2"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
