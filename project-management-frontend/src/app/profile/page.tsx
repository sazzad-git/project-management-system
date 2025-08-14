"use client";

import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ProfilePage = () => {
  const { isAuthenticated, user, status } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    if (status === 'succeeded' && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, status, router]);

  if (status !== 'succeeded' || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
        <p className="text-lg text-gray-700 font-medium">Loading profile...</p>
      </div>
    );
  }

  // console.log(user.profileImage)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-28 h-28 mb-4">
            <Image
              src={
                user.profileImage ||
                'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1331&auto=format&fit=crop'
              }
              alt="Profile Picture"
              fill
              className="rounded-full object-cover shadow-md"
            />
          </div>
          <h1 className="text-2xl font-bold text-blue-700">{user.name}</h1>
          <p className="text-gray-500">
            {user.jobTitle || 'No job title specified'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">Email</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Role</h3>
            <p className="text-gray-600 capitalize">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/profile/edit"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200"
          >
            Edit Profile
          </Link>
          <Link
            href="/profile/edit"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200"
          >
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
