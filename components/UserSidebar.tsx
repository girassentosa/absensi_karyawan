'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface UserSidebarProps {
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

export default function UserSidebar({ isSidebarOpen: externalSidebarOpen, setIsSidebarOpen: externalSetSidebarOpen }: UserSidebarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [previewAvatar, setPreviewAvatar] = useState('');

  // Use external state if provided, otherwise use internal state
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const isSidebarOpen = externalSidebarOpen !== undefined ? externalSidebarOpen : internalSidebarOpen;
  const setIsSidebarOpen = externalSetSidebarOpen || setInternalSidebarOpen;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchEmployeeData(parsedUser.email);
    }
  }, []);

  const fetchEmployeeData = async (email: string) => {
    try {
      const response = await fetch(`/api/employees?email=${email}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setEmployee(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleOpenProfileModal = () => setShowProfileModal(true);

  const handleOpenEditProfileModal = () => {
    setShowProfileModal(false);
    const avatarUrl = user?.avatar_url || '/images/profile.jpg';
    setEditFormData({
      username: user?.username || '',
      email: user?.email || '',
      avatarUrl: avatarUrl,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPreviewAvatar(avatarUrl);
    setShowEditProfileModal(true);
  };

  const handleAvatarUrlChange = (url: string) => {
    setEditFormData({ ...editFormData, avatarUrl: url });
    setPreviewAvatar(url);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData.username || editFormData.username.trim() === '') {
      alert('Username tidak boleh kosong!');
      return;
    }

    if (!editFormData.email || editFormData.email.trim() === '') {
      alert('Email tidak boleh kosong!');
      return;
    }

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
        const updatedUser = {
          ...user,
          username: data.updatedUsername || editFormData.username,
          email: data.updatedEmail || editFormData.email,
          avatar_url: editFormData.avatarUrl
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Close modal first
        setShowEditProfileModal(false);
        
        setEditFormData({
          ...editFormData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Then show notification after a short delay
        setTimeout(() => {
          if (editFormData.newPassword) {
            alert('✅ Profile berhasil diupdate!\n\nPassword Anda telah diubah. Tetap di halaman ini dan gunakan password baru untuk login berikutnya.');
          } else {
            alert('✅ Profile berhasil diupdate!');
          }
          // Refresh page to update UI with new data
          window.location.reload();
        }, 100);
      } else {
        alert('❌ ' + (data.error || 'Gagal update profile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Gagal update profile');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const menuItems = [
    {
      href: '/user/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
        </svg>
      ),
    },
    {
      href: '/user/face-training',
      label: 'Latih Wajah',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: '/user/attendance',
      label: 'Absensi',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: '/user/history',
      label: 'Riwayat Absensi',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: '/user/leave',
      label: 'Pengajuan Izin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Profile Section - Top */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <button
              onClick={handleOpenProfileModal}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all group shadow-sm"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-11 h-11 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm ${user?.avatar_url ? 'hidden' : ''}`}>
                {getInitials(user?.username || user?.email || '')}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{user?.username || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{employee?.employee_code || 'Karyawan'}</p>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button - Bottom */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Profile Modal (View) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-4 sm:mb-6">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-2xl border-4 border-slate-200"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl sm:text-5xl shadow-2xl">
                  {getInitials(user?.username || user?.email || '')}
                </div>
              )}
            </div>
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{user?.username || 'User'}</h2>
              <p className="text-slate-500 text-xs sm:text-sm mb-1 truncate">{user?.email || ''}</p>
              <span className="inline-block px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                Karyawan
              </span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={handleOpenEditProfileModal}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" onClick={() => setShowEditProfileModal(false)}>
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-sm sm:max-w-lg lg:max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto custom-scrollbar animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </h3>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Avatar Section */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-slate-200">
                <h4 className="text-gray-900 font-bold mb-4 text-sm sm:text-base flex items-center gap-2" style={{ color: '#111827' }}>
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Foto Profile
                </h4>
                
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  {/* Preview Avatar */}
                  <div className="flex-shrink-0">
                    {previewAvatar ? (
                      <img 
                        src={previewAvatar} 
                        alt="Preview" 
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-xl"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.alt = 'Invalid URL';
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-xl border-4 border-white">
                        {getInitials(user?.username || user?.email || '')}
                      </div>
                    )}
                  </div>

                  {/* Input URL */}
                  <div className="flex-1 w-full">
                    <label className="block text-gray-900 mb-2 text-xs sm:text-sm font-semibold">
                      URL Foto
                    </label>
                    <input 
                      type="text" 
                      value={editFormData.avatarUrl} 
                      onChange={(e) => handleAvatarUrlChange(e.target.value)} 
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" 
                    />
                    <p className="text-xs text-slate-500 mt-1.5">
                      💡 Tinggal ubah nama file: /images/<strong>nama-foto.jpg</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200">
                <h4 className="text-gray-900 font-bold mb-4 text-sm sm:text-base flex items-center gap-2" style={{ color: '#111827' }}>
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informasi Akun
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2" style={{ color: '#111827' }}>Username</label>
                    <input 
                      type="text" 
                      value={editFormData.username} 
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })} 
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" 
                      placeholder="Username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2" style={{ color: '#111827' }}>Email</label>
                    <input 
                      type="email" 
                      value={editFormData.email} 
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} 
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" 
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="bg-amber-50 rounded-xl p-4 sm:p-6 border border-amber-200">
                <h4 className="text-gray-900 font-bold mb-1 text-sm sm:text-base flex items-center gap-2" style={{ color: '#111827' }}>
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Ubah Password
                </h4>
                <p className="text-xs text-amber-700 mb-4">Kosongkan jika tidak ingin mengubah password</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>Password Saat Ini</label>
                    <input 
                      type="password" 
                      value={editFormData.currentPassword} 
                      onChange={(e) => setEditFormData({ ...editFormData, currentPassword: e.target.value })} 
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm" 
                      placeholder="Masukkan password saat ini"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>Password Baru</label>
                      <input 
                        type="password" 
                        value={editFormData.newPassword} 
                        onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })} 
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm" 
                        placeholder="Password baru"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>Konfirmasi Password</label>
                      <input 
                        type="password" 
                        value={editFormData.confirmPassword} 
                        onChange={(e) => setEditFormData({ ...editFormData, confirmPassword: e.target.value })} 
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm" 
                        placeholder="Konfirmasi password"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-slate-50 p-4 sm:p-6 border-t border-slate-200 rounded-b-xl sm:rounded-b-2xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleUpdateProfile} 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Perubahan
                </button>
                <button 
                  onClick={() => setShowEditProfileModal(false)} 
                  className="flex-1 sm:flex-none bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-700 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SidebarToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-all"
      aria-label="Toggle Sidebar"
    >
      <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}

