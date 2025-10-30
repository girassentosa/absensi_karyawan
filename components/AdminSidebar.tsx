'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminSidebarProps {
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (value: boolean) => void;
}

export default function AdminSidebar({ isSidebarOpen: externalSidebarOpen, setIsSidebarOpen: externalSetSidebarOpen }: AdminSidebarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isSidebarOpen = externalSidebarOpen !== undefined ? externalSidebarOpen : internalSidebarOpen;
  const setIsSidebarOpen = externalSetSidebarOpen || setInternalSidebarOpen;
  const [user, setUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileFormData, setEditProfileFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatarUrl: '',
  });
  const [previewAvatar, setPreviewAvatar] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getInitials = (email: string) => {
    if (!email) return 'AD';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const handleOpenProfileModal = () => {
    setShowProfileModal(true);
  };

  const handleOpenEditProfileModal = () => {
    setEditProfileFormData({
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      avatarUrl: user?.avatar_url || '/images/profile.jpg',
    });
    setPreviewAvatar(user?.avatar_url || '/images/profile.jpg');
    setShowProfileModal(false);
    setShowEditProfileModal(true);
  };

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setEditProfileFormData({ ...editProfileFormData, avatarUrl: url });
    setPreviewAvatar(url);
  };

  const handleUpdateProfile = async () => {
    try {
      const { username, email, currentPassword, newPassword, confirmPassword, avatarUrl } = editProfileFormData;

      if (newPassword && newPassword !== confirmPassword) {
        alert('Password baru dan konfirmasi password tidak cocok!');
        return;
      }

      if (newPassword && !currentPassword) {
        alert('Masukkan password saat ini untuk mengubah password!');
        return;
      }

      const updateData: any = {
        currentEmail: user.email,
      };

      if (username && username !== user.username) {
        updateData.newUsername = username;
      }

      if (email && email !== user.email) {
        updateData.newEmail = email;
      }

      if (avatarUrl !== user.avatar_url) {
        updateData.avatarUrl = avatarUrl;
      }

      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...storedUser,
          username: data.updatedUsername || storedUser.username,
          email: data.updatedEmail || storedUser.email,
          avatar_url: avatarUrl,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        // Close modal first
        setShowEditProfileModal(false);
        setEditProfileFormData({
          username: '',
          email: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          avatarUrl: '',
        });

        // Then show notification after a short delay
        setTimeout(() => {
          if (newPassword) {
            alert('✅ Profil berhasil diperbarui!\n\nPassword Anda telah diubah. Tetap di halaman ini dan gunakan password baru untuk login berikutnya.');
          } else {
            alert('✅ Profil berhasil diperbarui!');
          }
          // Refresh page to update UI with new data
          window.location.reload();
        }, 100);
      } else {
        alert('❌ ' + (data.error || 'Gagal memperbarui profil'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Terjadi kesalahan saat memperbarui profil');
    }
  };

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/admin/employees', label: 'Daftar Karyawan', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { href: '/admin/schedule', label: 'Jadwal & Kebijakan', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { href: '/admin/leave', label: 'Pengajuan Izin', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { href: '/admin/attendance', label: 'Laporan Absensi', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { href: '/admin/office-locations', label: 'Lokasi Kantor', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { href: '/admin/settings', label: 'Pengaturan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-lg transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Profile Section - TOP */}
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
                {getInitials(user?.email || '')}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-slate-900 font-bold text-sm truncate">{user?.username || 'Admin'}</p>
                <p className="text-slate-500 text-xs">Administrator</p>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile after click
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          {/* Footer Actions */}
          <div className="mt-auto p-3 border-t border-slate-200 bg-white">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 mb-4" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
              ) : null}
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-4 border-4 border-white shadow-lg ${user?.avatar_url ? 'hidden' : ''}`}>
                {getInitials(user?.email || '')}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{user?.username || 'Admin'}</h3>
              <p className="text-slate-500 mb-6">{user?.email}</p>
              <button onClick={handleOpenEditProfileModal} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl mb-3">Edit Profile</button>
              <button onClick={() => setShowProfileModal(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all">Tutup</button>
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
                <h4 className="text-slate-900 font-bold mb-4 text-sm sm:text-base flex items-center gap-2">
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
                        {getInitials(user?.email || '')}
                      </div>
                    )}
                  </div>

                  {/* Input URL */}
                  <div className="flex-1 w-full">
                    <label className="block text-slate-700 mb-2 text-xs sm:text-sm font-semibold">
                      URL Foto
                    </label>
                    <input 
                      type="text" 
                      value={editProfileFormData.avatarUrl} 
                      onChange={handleAvatarUrlChange} 
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
                <h4 className="text-slate-900 font-bold mb-4 text-sm sm:text-base flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informasi Akun
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Username</label>
                    <input 
                      type="text" 
                      value={editProfileFormData.username} 
                      onChange={(e) => setEditProfileFormData({ ...editProfileFormData, username: e.target.value })} 
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" 
                      placeholder="Username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={editProfileFormData.email} 
                      onChange={(e) => setEditProfileFormData({ ...editProfileFormData, email: e.target.value })} 
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" 
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="bg-amber-50 rounded-xl p-4 sm:p-6 border border-amber-200">
                <h4 className="text-slate-900 font-bold mb-1 text-sm sm:text-base flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Ubah Password
                </h4>
                <p className="text-xs text-amber-700 mb-4">Kosongkan jika tidak ingin mengubah password</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Password Saat Ini</label>
                    <input 
                      type="password" 
                      value={editProfileFormData.currentPassword} 
                      onChange={(e) => setEditProfileFormData({ ...editProfileFormData, currentPassword: e.target.value })} 
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm" 
                      placeholder="Masukkan password saat ini"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Password Baru</label>
                      <input 
                        type="password" 
                        value={editProfileFormData.newPassword} 
                        onChange={(e) => setEditProfileFormData({ ...editProfileFormData, newPassword: e.target.value })} 
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm" 
                        placeholder="Password baru"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Konfirmasi Password</label>
                      <input 
                        type="password" 
                        value={editProfileFormData.confirmPassword} 
                        onChange={(e) => setEditProfileFormData({ ...editProfileFormData, confirmPassword: e.target.value })} 
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

// Export Mobile Toggle Button Component
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

