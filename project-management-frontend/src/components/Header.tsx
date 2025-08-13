"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setAuthState, logout } from '../store/features/auth/authSlice';
import { FaUserCircle, FaBell, FaSearch, FaProjectDiagram } from 'react-icons/fa';

const Header = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  // আমরা সরাসরি Redux স্টোর থেকে isAuthenticated এবং user তথ্য নিচ্ছি
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // পেজ লোড হওয়ার সময় একবারই চলবে
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const fetchProfile = async () => {
        try {
          const profileResponse = await fetch('http://localhost:3001/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (profileResponse.ok) {
            const userProfile = await profileResponse.json();
            dispatch(setAuthState({ user: userProfile, token }));
          } else {
            // টোকেন ভ্যালিড না হলে লগআউট করে দিন
            dispatch(logout());
          }
        } catch (error) {
          console.error('Failed to fetch profile on load:', error);
          dispatch(logout());
        }
      };
      fetchProfile();
    }
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
    router.push('/login');
  };

  // ড্রপডাউন মেনুর বাইরে ক্লিক করলে বন্ধ করার জন্য useEffect
  useEffect(() => {
    const closeDropdown = () => setIsDropdownOpen(false);
    if (isDropdownOpen) {
      window.addEventListener('click', closeDropdown);
    }
    return () => window.removeEventListener('click', closeDropdown);
  }, [isDropdownOpen]);

  // হেডারটি এখন সবসময় রেন্ডার হবে
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
    }}>
      {/* বাম অংশ (অপরিবর্তিত) */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FaProjectDiagram size={24} style={{ marginRight: '10px' }} />
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold', fontSize: '1.2rem' }}>
          ProjectFlow
        </Link>
      </div>

      {/* মধ্যম অংশ (অপরিবর্তিত) */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '50%', padding: '8px 15px', backgroundColor: '#e9ecef', borderRadius: '20px', cursor: 'pointer' }}>
          <FaSearch style={{ color: '#6c757d' }} />
          <span style={{ marginLeft: '10px', color: '#6c757d' }}>Search...</span>
        </div>
      </div>

      {/* --- ডান অংশ (পরিবর্তিত লজিক) --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {isAuthenticated ? (
          // যদি ইউজার লগইন করা থাকে
          <>
            <FaBell size={22} style={{ cursor: 'pointer' }} />
            <div style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
              >
                <FaUserCircle size={28} />
                <span style={{ marginLeft: '8px', fontWeight: '500' }}>{user?.name || 'User'}</span>
              </div>
              {isDropdownOpen && (
                <div style={{ position: 'absolute', top: '40px', right: '0', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '200px', zIndex: 10 }}>
                  <Link href="/profile" onClick={() => setIsDropdownOpen(false)} style={{ display: 'block', padding: '10px 15px', textDecoration: 'none', color: 'black' }}>
                    View Profile
                  </Link>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '10px 15px', border: 'none', backgroundColor: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          // যদি ইউজার লগইন করা না থাকে
          <Link href="/login" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;