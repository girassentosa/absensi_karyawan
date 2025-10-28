'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    todaysAttendance: 0,
    pendingCheckouts: 0,
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [previewAvatar, setPreviewAvatar] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/admin');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/user/attendance');
      return;
    }

    setUser(parsedUser);
    fetchUserProfile(parsedUser.email);
    fetchStats();
  }, [router]);

  const fetchUserProfile = async (email: string) => {
    try {
      const response = await fetch(`/api/employees?email=${email}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const employeeData = data.data[0];
        // Fetch from app_users to get avatar_url
        const userResponse = await fetch(`/api/employees?email=${email}`);
        const userData = await userResponse.json();
        
        // Update user with avatar if exists
        if (userData.success && userData.data.length > 0 && userData.data[0].avatar_url) {
          setUser((prev: any) => ({
            ...prev,
            avatar_url: userData.data[0].avatar_url
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch employees
      const employeesRes = await fetch('/api/employees');
      const employeesData = await employeesRes.json();
      
      // Fetch today's attendance
      const attendanceRes = await fetch('/api/attendance/today');
      const attendanceData = await attendanceRes.json();

      if (employeesData.success && attendanceData.success) {
        const totalEmployees = employeesData.data.length;
        const activeEmployees = employeesData.data.filter((e: any) => e.is_active).length;
        const todaysAttendance = attendanceData.data.length;
        const pendingCheckouts = attendanceData.data.filter((a: any) => !a.check_out_time).length;

        setStats({
          totalEmployees,
          activeEmployees,
          todaysAttendance,
          pendingCheckouts,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/admin');
  };

  const handleOpenProfileModal = () => {
    setShowProfileModal(true);
  };

  const handleOpenEditModal = () => {
    setShowProfileModal(false);
    const avatarUrl = user?.avatar_url || '/images/profile1.jpg';
    setEditFormData({
      username: user?.username || '',
      email: user?.email || '',
      avatarUrl: avatarUrl,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPreviewAvatar(avatarUrl);
    setShowEditModal(true);
  };

  const handleAvatarUrlChange = (url: string) => {
    setEditFormData({ ...editFormData, avatarUrl: url });
    setPreviewAvatar(url);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!editFormData.username || editFormData.username.trim() === '') {
      alert('Username tidak boleh kosong!');
      return;
    }

    if (!editFormData.email || editFormData.email.trim() === '') {
      alert('Email tidak boleh kosong!');
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      alert('Format email tidak valid!');
      return;
    }

    if (editFormData.newPassword && editFormData.newPassword !== editFormData.confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }

    if (editFormData.newPassword && editFormData.newPassword.length < 6) {
      alert('Password baru minimal 6 karakter!');
      return;
    }

    // Password saat ini wajib jika ganti password
    if (editFormData.newPassword && !editFormData.currentPassword) {
      alert('Password saat ini harus diisi untuk mengganti password!');
      return;
    }

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmail: user.email,
          newEmail: editFormData.email,
          username: editFormData.username,
          currentPassword: editFormData.currentPassword || undefined,
          newPassword: editFormData.newPassword || undefined,
          avatarUrl: editFormData.avatarUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local user data
        const updatedUser = {
          ...user,
          username: data.updatedUsername || editFormData.username,
          email: data.updatedEmail || editFormData.email,
          avatar_url: editFormData.avatarUrl
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Berhasil update, tetap di dashboard
        alert('✅ Profile berhasil diupdate!');
        setShowEditModal(false);
        
        // Reset form password fields
        setEditFormData({
          ...editFormData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(data.error || 'Gagal update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Gagal update profile');
    }
  };

  const getInitials = (email: string) => {
    if (!email) return 'A';
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleOpenProfileModal}
                className="flex items-center gap-3 hover:bg-white/5 rounded-xl p-2 transition-all group"
              >
                {/* Profile Photo */}
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform border-2 border-white/20"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform ${user?.avatar_url ? 'hidden' : ''}`}>
                  {getInitials(user?.email || '')}
                </div>
                {/* Name & Role */}
                <div className="text-left hidden sm:block">
                  <p className="text-white font-semibold text-sm">
                    {user?.username || 'Admin'}
                  </p>
                  <p className="text-white/60 text-xs">Dashboard Admin</p>
                </div>
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 rounded-lg text-white text-sm font-semibold transition-all"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6">
            <p className="text-white/60 text-xs sm:text-sm mb-2">Total Karyawan</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalEmployees}</p>
        </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6">
            <p className="text-white/60 text-xs sm:text-sm mb-2">Karyawan Aktif</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.activeEmployees}</p>
                </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6">
            <p className="text-white/60 text-xs sm:text-sm mb-2">Absensi Hari Ini</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.todaysAttendance}</p>
              </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6">
            <p className="text-white/60 text-xs sm:text-sm mb-2">Belum Check-Out</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.pendingCheckouts}</p>
                </div>
              </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link
            href="/admin/employees"
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Kelola Karyawan</h3>
            </div>
            <p className="text-white/60 text-sm sm:text-base">Tambah, edit, atau hapus karyawan</p>
          </Link>
          <Link
            href="/admin/attendance"
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Lihat Absensi</h3>
            </div>
            <p className="text-white/60 text-sm sm:text-base">Cek catatan absensi karyawan</p>
          </Link>
          <Link
            href="/admin/office-locations"
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Lokasi Kantor</h3>
            </div>
            <p className="text-white/60 text-sm sm:text-base">Kelola lokasi untuk GPS check-in</p>
          </Link>
          <Link
            href="/admin/settings"
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Pengaturan</h3>
            </div>
            <p className="text-white/60 text-sm sm:text-base">Konfigurasi sistem</p>
          </Link>
            </div>
      </main>

      {/* Profile Modal (View) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
            {/* Profile Photo - Large */}
            <div className="flex justify-center mb-6">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-white/20"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-5xl shadow-2xl ${user?.avatar_url ? 'hidden' : ''}`}>
                {getInitials(user?.email || '')}
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user?.username || 'Admin'}
              </h2>
              <p className="text-white/60 text-sm mb-1">{user?.email || ''}</p>
              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold border border-purple-500/50">
                Administrator
              </span>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleOpenEditModal}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal - 2 Column Layout */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6" onClick={() => setShowEditModal(false)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-full sm:max-w-2xl lg:max-w-4xl w-full shadow-2xl border border-white/10 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">✏️ Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6">
              {/* Profile Photo Section - Full Width */}
              <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                  <span>📸</span> Foto Profile
                </h3>
                
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  {/* Preview Photo */}
                  <div className="flex-shrink-0">
                    {previewAvatar ? (
                      <img
                        src={previewAvatar}
                        alt="Preview"
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-xl border-4 border-white/20"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl ${previewAvatar ? 'hidden' : ''}`}>
                      {getInitials(user?.email || '')}
                    </div>
                  </div>

                  {/* Photo URL Input */}
                  <div className="flex-1 w-full">
                    <label className="block text-white/80 mb-2 text-xs sm:text-sm font-semibold">
                      URL Foto
                    </label>
                    <input
                      type="text"
                      value={editFormData.avatarUrl}
                      onChange={(e) => handleAvatarUrlChange(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="/images/profile1.jpg"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleAvatarUrlChange('/images/profile1.jpg')}
                        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs rounded-md border border-blue-500/50 transition-all"
                      >
                        profile1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAvatarUrlChange('/images/profile2.jpg')}
                        className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs rounded-md border border-purple-500/50 transition-all"
                      >
                        profile2
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAvatarUrlChange('/images/profile3.jpg')}
                        className="px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 text-xs rounded-md border border-pink-500/50 transition-all"
                      >
                        profile3
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 Column Layout: Account Info & Security */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column: Account Information */}
                <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                    <span>👤</span> Informasi Akun
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Username */}
                    <div>
                      <label className="block text-white/80 mb-2 text-xs sm:text-sm font-semibold">
                        Username <span className="text-blue-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.username}
                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                        placeholder="Masukkan username"
                        required
                      />
                      <p className="text-white/40 text-xs mt-1">Untuk login</p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white/80 mb-2 text-xs sm:text-sm font-semibold">
                        Email <span className="text-blue-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                        placeholder="Masukkan email"
                        required
                      />
                      <p className="text-white/40 text-xs mt-1">Email kontak</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Security/Password */}
                <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                    <span>🔒</span> Keamanan <span className="text-white/40 text-xs font-normal">(Opsional)</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-white/80 mb-2 text-xs sm:text-sm font-semibold">
                        Password Saat Ini
                      </label>
                      <input
                        type="password"
                        value={editFormData.currentPassword}
                        onChange={(e) => setEditFormData({ ...editFormData, currentPassword: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                        placeholder="Password lama"
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-white/80 mb-2 text-xs sm:text-sm font-semibold">
                        Password Baru
                      </label>
                      <input
                        type="password"
                        value={editFormData.newPassword}
                        onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                        placeholder="Min. 6 karakter"
                        minLength={6}
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-white/80 mb-2 text-xs sm:text-sm font-semibold">
                        Konfirmasi Password
                      </label>
                      <input
                        type="password"
                        value={editFormData.confirmPassword}
                        onChange={(e) => setEditFormData({ ...editFormData, confirmPassword: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                        placeholder="Ulangi password"
                        minLength={6}
                      />
                    </div>

                    <p className="text-white/40 text-xs">
                      💡 Kosongkan jika tidak ingin mengubah password
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Full Width */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 transition-all text-sm sm:text-base"
                >
                  Batal
                </button>
              </div>

              {/* Info Footer */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4">
                <p className="text-blue-300 text-xs sm:text-sm flex items-start gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Username & Email</strong> akan langsung tersimpan. <strong>Password</strong> hanya berubah jika diisi semua field password.
                  </span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

