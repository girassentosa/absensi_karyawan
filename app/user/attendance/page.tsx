'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FaceVerificationCamera from '@/components/FaceVerificationCamera';
import VerificationResultModal from '@/components/VerificationResultModal';

export default function AttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Profile modal states
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
  
  // Verification result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    score: number;
    trainingScore?: number;
    threshold?: number;
    error?: string;
  } | null>(null);
  
  // Processing modal state (intermediate loading after verification)
  const [showProcessingModal, setShowProcessingModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/user');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    console.log('👤 Logged in user:', parsedUser);
    setUser(parsedUser);
    fetchEmployeeData(parsedUser.email);
    getLocation();
  }, [router]);

  // Fetch attendance after employee data is loaded
  useEffect(() => {
    if (employee) {
      console.log('👷 Employee data loaded, fetching attendance...');
      fetchTodayAttendance();
    }
  }, [employee]);

  const fetchEmployeeData = async (email: string) => {
    try {
      console.log('🔍 Fetching employee data for email:', email);
      const response = await fetch(`/api/employees?email=${email}`);
      const data = await response.json();
      
      console.log('📊 Employee API response:', data);
      
      if (data.success && data.data.length > 0) {
        console.log('✅ Employee found:', data.data[0]);
        setEmployee(data.data[0]);
      } else {
        console.log('❌ No employee found for email:', email);
        console.log('📋 Available employees:', data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching employee data:', error);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      // Wait for employee data to be loaded first
      if (!employee) {
        console.log('⏳ Employee data not loaded yet, skipping attendance fetch');
        return;
      }

      console.log('🔍 Fetching attendance for employee_id:', employee.id);
      const response = await fetch(`/api/attendance/today?employee_id=${employee.id}`);
      const data = await response.json();
      
      console.log('📊 Attendance API response:', data);
      
      if (data.success && data.data.length > 0) {
        console.log('✅ Today attendance found:', data.data[0]);
        setTodayAttendance(data.data[0]);
      } else {
        console.log('📅 No attendance record for today');
      }
    } catch (error) {
      console.error('❌ Error fetching attendance:', error);
    }
  };

  const handleCheckIn = () => {
    setShowCamera(true);
  };

  // State untuk track apakah sedang proses check-in atau check-out
  const [isCheckOut, setIsCheckOut] = useState(false);

  const handleCheckOut = () => {
    setIsCheckOut(true);
    setShowCamera(true);
  };

  // Get system settings from localStorage (admin settings)
  const getSystemSettings = () => {
    try {
      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('⚙️ Loaded system settings:', settings);
        return settings;
      }
    } catch (error) {
      console.error('❌ Error loading system settings:', error);
    }
    
    // Default settings if not found
    const defaultSettings = {
      faceThreshold: 70,
      gpsRadius: 100
    };
    console.log('⚙️ Using default system settings:', defaultSettings);
    return defaultSettings;
  };

  // Validate GPS location against office locations
  const validateGPSLocation = async (userLat: number, userLng: number) => {
    try {
      console.log('📍 Validating GPS location...');
      console.log(`📍 User location: ${userLat}, ${userLng}`);
      
      // Get GPS radius from admin settings
      const systemSettings = getSystemSettings();
      const maxRadius = systemSettings.gpsRadius;
      console.log(`⚙️ Using GPS radius: ${maxRadius}m (from admin settings)`);
      
      // Fetch office locations
      const response = await fetch('/api/office-locations');
      const data = await response.json();
      
      if (!data.success || !data.data.length) {
        console.log('❌ No office locations found');
        return { valid: false, error: 'Tidak ada lokasi kantor yang terdaftar' };
      }
      
      // Check if user is within range of any active office location
      for (const office of data.data) {
        if (!office.is_active) continue;
        
        const distance = calculateDistance(userLat, userLng, office.latitude, office.longitude);
        console.log(`📏 Distance to ${office.name}: ${distance.toFixed(2)}m (max: ${maxRadius}m)`);
        
        if (distance <= maxRadius) {
          console.log(`✅ User is within range of ${office.name}`);
          return { valid: true, office: office.name, distance: distance.toFixed(2) };
        }
      }
      
      console.log('❌ User is not within range of any office location');
      return { 
        valid: false, 
        error: `Anda berada di luar jangkauan kantor (maksimal ${maxRadius}m dari lokasi kantor)` 
      };
    } catch (error: any) {
      console.error('❌ Error validating GPS:', error);
      return { valid: false, error: 'Gagal memvalidasi lokasi GPS' };
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const handleFaceVerification = async (result: { 
    success: boolean; 
    score: number; 
    trainingScore?: number;
    threshold?: number;
    image?: string; 
    error?: string 
  }) => {
    console.log('🎯 Face verification result:', result);

    // Step 1: Close camera
    setShowCamera(false);
    
    // Step 2: Show processing modal
    setShowProcessingModal(true);
    console.log('⏳ Showing processing modal...');
    
    // Step 3: Simulate processing (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Close processing modal
    setShowProcessingModal(false);
    console.log('✅ Processing complete, showing result modal...');
    
    // Step 5: Store result and show result modal
    setVerificationResult(result);
    setShowResultModal(true);
  };

  const handleContinueAfterVerification = async () => {
    if (!verificationResult?.success) return;
    
    setLoading(true);

    try {
      if (!employee) {
        alert('Data karyawan tidak ditemukan.');
        setLoading(false);
        return;
      }

      // Validate GPS location
      if (!location) {
        alert('❌ Lokasi GPS tidak tersedia. Pastikan GPS aktif dan izin lokasi diberikan.');
        setLoading(false);
        return;
      }

      console.log('📍 Validating GPS location...');
      const gpsValidation = await validateGPSLocation(location.lat, location.lng);
      
      if (!gpsValidation.valid) {
        alert(`❌ ${gpsValidation.error}`);
        setLoading(false);
        return;
      }

      // Check if this is check-in or check-out
      if (isCheckOut) {
        // Handle check-out
        console.log('🚪 Verification successful, proceeding with check-out...');
        const response = await fetch('/api/attendance/check-out', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: employee.id,
            face_match_score: verificationResult.score,
            latitude: location?.lat,
            longitude: location?.lng,
          }),
        });

        const data = await response.json();
        if (data.success) {
          alert(`✅ Check-out berhasil!\n📊 Skor verifikasi: ${verificationResult.score}%\n📍 Lokasi: ${gpsValidation.office} (${gpsValidation.distance}m)\n⏰ Waktu: ${new Date().toLocaleString()}`);
          fetchTodayAttendance();
          setIsCheckOut(false); // Reset flag
        } else {
          alert(`❌ Check-out gagal: ${data.error || 'Unknown error'}`);
        }
      } else {
        // Handle check-in
        console.log('✅ Verification successful, proceeding with check-in...');
        const response = await fetch('/api/attendance/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: employee.id,
            face_match_score: verificationResult.score,
            latitude: location?.lat,
            longitude: location?.lng,
          }),
        });

        const data = await response.json();
        if (data.success) {
          alert(`✅ Check-in berhasil!\n📊 Skor verifikasi: ${verificationResult.score}%\n📍 Lokasi: ${gpsValidation.office} (${gpsValidation.distance}m)\n⏰ Waktu: ${new Date().toLocaleString()}`);
          fetchTodayAttendance();
        } else {
          alert(`❌ Check-in gagal: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`❌ ${isCheckOut ? 'Check-out' : 'Check-in'} gagal: ${error.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };


  // Profile modal handlers
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

        alert('✅ Profile berhasil diupdate!');
        setShowEditModal(false);
        
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
    if (!email) return 'U';
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/user');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="flex items-center justify-between gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Absensi Karyawan</h1>
          
          <div className="flex items-center gap-2">
            {/* Profile Section */}
            <button
              onClick={handleOpenProfileModal}
              className="flex items-center gap-2 sm:gap-3 hover:bg-white/5 rounded-xl p-2 transition-all group"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform border-2 border-white/20"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover:scale-110 transition-transform ${user?.avatar_url ? 'hidden' : ''}`}>
                {getInitials(user?.email || '')}
              </div>
              <div className="text-left hidden sm:block flex-shrink-0">
                <p className="text-white font-semibold text-sm">{user?.username || 'User'}</p>
                <p className="text-white/60 text-xs">Karyawan</p>
              </div>
            </button>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl shadow-lg transition-all text-xs sm:text-sm flex items-center gap-1.5"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Check-in Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Check In</h2>
            <button
              onClick={() => {
                if (!employee?.face_encoding_path) {
                  alert('Wajah Anda belum dilatih. Silakan hubungi admin untuk melakukan pelatihan wajah.');
                  return;
                }
                setShowCamera(true);
              }}
              disabled={todayAttendance || loading}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:from-green-500 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Processing...' : 'Check In with Face'}
            </button>
            {!employee ? (
              <p className="text-red-300 text-xs sm:text-sm mt-2 text-center">
                ❌ Data karyawan tidak ditemukan. Hubungi admin.
              </p>
            ) : !employee.face_encoding_path ? (
              <p className="text-yellow-300 text-xs sm:text-sm mt-2 text-center">
                ⚠️ Wajah belum dilatih. Hubungi admin untuk pelatihan.
              </p>
            ) : (
              <p className="text-green-300 text-xs sm:text-sm mt-2 text-center">
                ✅ Wajah sudah dilatih. Siap untuk check-in.
              </p>
            )}
          </div>

          {/* Check-out Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Check Out</h2>
            <button
              onClick={handleCheckOut}
              disabled={!todayAttendance || todayAttendance.check_out_time || loading}
              className="w-full bg-gradient-to-r from-red-400 to-pink-500 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:from-red-500 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Processing...' : 'Check Out'}
            </button>
          </div>
        </div>

        {/* Today's Status */}
        {todayAttendance && (
          <div className="mt-6 sm:mt-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Today's Status</h3>
            <div className="space-y-2 text-white/80 text-sm sm:text-base">
              <p>Check-in: {new Date(todayAttendance.check_in_time).toLocaleString()}</p>
              {todayAttendance.check_out_time && (
                <p>Check-out: {new Date(todayAttendance.check_out_time).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showCamera && employee?.face_encoding_path && (
        <FaceVerificationCamera
          storedFaceEncoding={employee.face_encoding_path}
          trainingScore={employee.face_match_score}
          onVerificationComplete={handleFaceVerification}
          onClose={() => {
            setShowCamera(false);
            setIsCheckOut(false);
          }}
        />
      )}

      {/* Processing Modal (Intermediate Loading) */}
      {showProcessingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 max-w-xs sm:max-w-md w-full shadow-2xl">
            <div className="text-center">
              {/* Animated Spinner */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Outer rotating ring */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  {/* Inner pulsing circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-full animate-pulse opacity-50"></div>
                  </div>
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Memproses Hasil Verifikasi
              </h3>
              
              {/* Description */}
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Mohon tunggu sebentar, kami sedang memproses data verifikasi wajah Anda...
              </p>
              
              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Result Modal */}
      {verificationResult && (
        <VerificationResultModal
          isOpen={showResultModal}
          success={verificationResult.success}
          verificationScore={verificationResult.score}
          trainingScore={verificationResult.trainingScore}
          threshold={verificationResult.threshold}
          actionText={isCheckOut ? 'Lanjutkan Check-out' : 'Lanjutkan Check-in'}
          onClose={() => {
            setShowResultModal(false);
            setVerificationResult(null);
            setLoading(false);
            setIsCheckOut(false);
          }}
          onContinue={() => {
            setShowResultModal(false);
            setVerificationResult(null);
            handleContinueAfterVerification();
          }}
        />
      )}

      {/* Profile Modal (View) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-4 sm:mb-6">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-2xl border-4 border-white/20"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl sm:text-5xl shadow-2xl ${user?.avatar_url ? 'hidden' : ''}`}>
                {getInitials(user?.email || '')}
              </div>
            </div>
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{user?.username || 'User'}</h2>
              <p className="text-white/60 text-xs sm:text-sm mb-1 truncate">{user?.email || ''}</p>
              <span className="inline-block px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/50">
                Karyawan
              </span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={handleOpenEditModal}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg transition-all text-sm sm:text-base"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
      

      {/* Edit Profile Modal - 2 Column Layout (Same as Admin) - Copy dari admin */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6" onClick={() => setShowEditModal(false)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-full sm:max-w-2xl lg:max-w-4xl w-full shadow-2xl border border-white/10 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                    <span>👤</span> Informasi Akun
                  </h3>
                  
                  <div className="space-y-4">
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

                <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                    <span>🔒</span> Keamanan <span className="text-white/40 text-xs font-normal">(Opsional)</span>
                  </h3>
                  
                  <div className="space-y-4">
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

