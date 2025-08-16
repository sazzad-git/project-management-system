"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setAuthState } from "../../../store/features/auth/authSlice";

const EditProfilePage = () => {
  const { isAuthenticated, user, status } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState({
    name: "",
    jobTitle: "",
    profileImage: "",
    role: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        jobTitle: user.jobTitle || "",
        profileImage: user.profileImage || "",
        role: user.role || "developer",
      });
    }
  }, [user]);

  useEffect(() => {
    if (status === "succeeded" && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, status, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    const token = localStorage.getItem("token");
    const payload: { [key: string]: any } = {};

  if (profileData.name) payload.name = profileData.name;
  if (profileData.jobTitle) payload.jobTitle = profileData.jobTitle;
  if (profileData.role) payload.role = profileData.role;
  // Add payload here
  if (profileData.profileImage) {
    payload.profileImage = profileData.profileImage;
  }
    try {
      const response = await fetch("http://localhost:3001/users/me/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const updatedUser = await response.json();
      if (!response.ok) throw new Error(updatedUser.message);
      dispatch(setAuthState({ user: updatedUser, token: token! }));
      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:3001/auth/change-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(passwordData),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setMessage(result.message);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (status !== "succeeded") return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          ✏️ Edit Your Profile
        </h1>

        {message && (
          <p className="text-green-700 bg-green-100 p-3 rounded-lg mb-4 shadow">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-700 bg-red-100 p-3 rounded-lg mb-4 shadow">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Information form */}
          <form
            onSubmit={handleProfileUpdate}
            className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              👤 Update Information
            </h2>

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              className="border rounded-lg p-2 w-full mb-4 focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Job Title
            </label>
            <input
              type="text"
              value={profileData.jobTitle}
              onChange={(e) =>
                setProfileData({ ...profileData, jobTitle: e.target.value })
              }
              className="border rounded-lg p-2 w-full mb-4 focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Profile Image URL
            </label>
            <input
              type="text"
              value={profileData.profileImage}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  profileImage: e.target.value,
                })
              }
              className="border rounded-lg p-2 w-full mb-4 focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Role
            </label>
            <select
              value={profileData.role}
              onChange={(e) =>
                setProfileData({ ...profileData, role: e.target.value })
              }
              className="border rounded-lg p-2 w-full mb-4 focus:ring-2 focus:ring-blue-400 bg-gray-50"
            >
              <option value="developer">Developer</option>
              <option value="project_manager">Project Manager</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
            >
              Update Profile
            </button>
          </form>

          {/* Password change form */}
          <form
            onSubmit={handlePasswordChange}
            className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              🔒 Change Password
            </h2>

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              className="border rounded-lg p-2 w-full mb-4 focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />

            <label className="block mb-2 text-sm font-medium text-gray-600">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className="border rounded-lg p-2 w-full mb-4 focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmNewPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmNewPassword: e.target.value,
                })
              }
              className="border rounded-lg p-2 w-full mb-6 focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
