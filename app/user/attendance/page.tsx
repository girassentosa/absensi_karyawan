'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FaceVerificationCamera from '@/components/FaceVerificationCamera';
import VerificationResultModal from '@/components/VerificationResultModal';
import UserSidebar, { SidebarToggleButton } from '@/components/UserSidebar';

export default function AttendancePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState<any>(null);
  const [isHoliday, setIsHoliday] = useState<any>(null);
  
  // Verification result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    score: number;
    trainingScore?: number;
    threshold?: number;
    error?: string;
  } | null>(null);
  
  // Processing modal state
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  
  // Check-out flag
  const [isCheckOut, setIsCheckOut] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/user');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchEmployeeData(parsedUser.email);
    getLocation();
    fetchTodaySchedule();
    checkHoliday();
  }, [router]);

  const fetchTodaySchedule = async () => {
    try {
      const response = await fetch('/api/work-schedules');
      const data = await response.json();
      if (data.success) {
        // Get day of week in Asia/Jakarta timezone
        const now = new Date();
        const jakartaDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        const dayOfWeek = jakartaDate.getDay();
        const schedule = data.data.find((s: any) => s.day_of_week === dayOfWeek);
        setTodaySchedule(schedule);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const checkHoliday = async () => {
    try {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
      const response = await fetch(`/api/holidays?date=${today}`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setIsHoliday(data.data[0]);
      }
    } catch (error) {
      console.error('Error checking holiday:', error);
    }
  };

  useEffect(() => {
    if (employee) {
      fetchTodayAttendance();
    }
  }, [employee]);

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

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Error getting location:', error)
      );
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      if (!employee) return;

      const response = await fetch(`/api/attendance/today?employee_id=${employee.id}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setTodayAttendance(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const getSystemSettings = () => {
    try {
      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
    
    return { faceThreshold: 70, gpsRadius: 100 };
  };

  const validateGPSLocation = async (userLat: number, userLng: number) => {
    try {
      const systemSettings = getSystemSettings();
      const maxRadius = systemSettings.gpsRadius;
      
      const response = await fetch('/api/office-locations');
      const data = await response.json();
      
      if (!data.success || !data.data.length) {
        return { valid: false, error: 'Tidak ada lokasi kantor yang terdaftar' };
      }
      
      for (const office of data.data) {
        if (!office.is_active) continue;
        
        const distance = calculateDistance(userLat, userLng, office.latitude, office.longitude);
        
        if (distance <= maxRadius) {
          return { valid: true, office: office.name, distance: distance.toFixed(2) };
        }
      }
      
      return { 
        valid: false, 
        error: `Anda berada di luar jangkauan kantor (maksimal ${maxRadius}m dari lokasi kantor)` 
      };
    } catch (error: any) {
      return { valid: false, error: 'Gagal memvalidasi lokasi GPS' };
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const handleFaceVerification = async (result: { 
    success: boolean; 
    score: number; 
    trainingScore?: number;
    threshold?: number;
    image?: string; 
    error?: string 
  }) => {
    setShowCamera(false);
    setShowProcessingModal(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowProcessingModal(false);
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

      if (!location) {
        alert('❌ Lokasi GPS tidak tersedia. Pastikan GPS aktif dan izin lokasi diberikan.');
        setLoading(false);
        return;
      }

      const gpsValidation = await validateGPSLocation(location.lat, location.lng);
      
      if (!gpsValidation.valid) {
        alert(`❌ ${gpsValidation.error}`);
        setLoading(false);
        return;
      }

      if (isCheckOut) {
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
          const now = new Date();
          const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
          const timeStr = `${String(jakartaTime.getHours()).padStart(2, '0')}:${String(jakartaTime.getMinutes()).padStart(2, '0')}`;
          const dateStr = jakartaTime.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
          alert(`✅ Check-out berhasil!\n📊 Skor verifikasi: ${verificationResult.score}%\n📍 Lokasi: ${gpsValidation.office} (${gpsValidation.distance}m)\n⏰ Waktu: ${timeStr} - ${dateStr}`);
          fetchTodayAttendance();
          setIsCheckOut(false);
        } else {
          alert(`❌ Check-out gagal: ${data.error || 'Unknown error'}`);
        }
      } else {
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
          const now = new Date();
          const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
          const timeStr = `${String(jakartaTime.getHours()).padStart(2, '0')}:${String(jakartaTime.getMinutes()).padStart(2, '0')}`;
          const dateStr = jakartaTime.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
          alert(`✅ Check-in berhasil!\n📊 Skor verifikasi: ${verificationResult.score}%\n📍 Lokasi: ${gpsValidation.office} (${gpsValidation.distance}m)\n⏰ Waktu: ${timeStr} - ${dateStr}`);
        fetchTodayAttendance();
      } else {
        alert(`❌ Check-in gagal: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      alert(`❌ ${isCheckOut ? 'Check-out' : 'Check-in'} gagal: ${error.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // Convert to Asia/Jakarta timezone and format as 24-hour (HH:MM)
    const jakartaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const hours = String(jakartaDate.getHours()).padStart(2, '0');
    const minutes = String(jakartaDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Jakarta'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <UserSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <SidebarToggleButton onClick={() => setIsSidebarOpen(true)} />
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">Absensi</h1>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">{currentDate}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Holiday Banner */}
          {isHoliday && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 shadow-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">🎉 Hari Libur</h3>
                  <p className="text-sm text-white/90">{isHoliday.name}</p>
                  <p className="text-xs text-white/75 mt-1">{isHoliday.description || 'Selamat berlibur!'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Work Schedule Info */}
          {todaySchedule && (
            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 shadow-sm border ${
              todaySchedule.is_active 
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  todaySchedule.is_active 
                    ? 'bg-blue-500' 
                    : 'bg-gray-400'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
          <div>
                  <h3 className="text-sm font-semibold text-slate-600">Jadwal Hari Ini</h3>
                  <p className="text-lg font-bold text-slate-900">{todaySchedule.day_name}</p>
                </div>
              </div>
              
              {todaySchedule.is_active ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Jam Kerja</p>
                      <p className="text-base font-bold text-slate-900">{todaySchedule.start_time} - {todaySchedule.end_time}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Toleransi Terlambat</p>
                      <p className="text-base font-bold text-orange-600">{todaySchedule.late_tolerance_minutes} menit</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <p className="text-xs text-amber-800 flex items-center gap-1.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>Check-in setelah <strong>{todaySchedule.start_time}</strong> + <strong>{todaySchedule.late_tolerance_minutes} menit</strong> akan dicatat sebagai <strong>terlambat</strong>.</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/60 rounded-lg p-3 text-center">
                  <p className="text-sm font-semibold text-gray-700">Hari ini bukan hari kerja</p>
                </div>
              )}
            </div>
          )}

          {/* Employee Info Card */}
          {employee && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                {employee.avatar_url ? (
                  <img 
                    src={employee.avatar_url} 
                    alt={employee.full_name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-sm border-2 border-white"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                    {getInitials(employee.full_name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{employee.full_name}</h2>
                  <p className="text-sm text-slate-500">{employee.employee_code}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-semibold">
                      {employee.department || 'No Department'}
                    </span>
                    {employee.face_encoding_path && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-semibold">
                        ✓ Wajah Terlatih
                      </span>
            )}
          </div>
                </div>
              </div>
        </div>
          )}

          {/* Check In/Out Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Check In Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
              <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Check In</h3>
                    <p className="text-xs text-white/80">Masuk kantor</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5">
            <button
              onClick={() => {
                if (!employee?.face_encoding_path) {
                  alert('Wajah Anda belum dilatih. Silakan hubungi admin untuk melakukan pelatihan wajah.');
                  return;
                }
                    setIsCheckOut(false);
                setShowCamera(true);
              }}
              disabled={todayAttendance || loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm sm:text-base flex items-center justify-center gap-2"
            >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
              {loading ? 'Processing...' : 'Check In with Face'}
            </button>
                {todayAttendance && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 font-semibold flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Sudah Check-in: {formatTime(todayAttendance.check_in_time)}
                    </p>
                  </div>
                )}
              </div>
          </div>

            {/* Check Out Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
              <div className="bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Check Out</h3>
                    <p className="text-xs text-white/80">Pulang kantor</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5">
            <button
                  onClick={() => {
                    setIsCheckOut(true);
                    setShowCamera(true);
                  }}
                  disabled={!todayAttendance || todayAttendance.check_out_time || loading}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {loading ? 'Processing...' : 'Check out with Face'}
            </button>
                {todayAttendance?.check_out_time && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 font-semibold flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Sudah Check-out: {formatTime(todayAttendance.check_out_time)}
                    </p>
                  </div>
                )}
              </div>
          </div>
        </div>

          {/* Today's Attendance Summary */}
        {todayAttendance && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Ringkasan Absensi Hari Ini
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-green-600 font-medium mb-1">Check-in</p>
                  <p className="text-lg sm:text-xl font-bold text-green-700">{formatTime(todayAttendance.check_in_time)}</p>
                  <p className="text-xs text-green-600 mt-1">{new Date(todayAttendance.check_in_time).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-indigo-600 font-medium mb-1">Check-out</p>
                  <p className="text-lg sm:text-xl font-bold text-indigo-700">
                    {todayAttendance.check_out_time ? formatTime(todayAttendance.check_out_time) : 'Belum Check-out'}
                  </p>
              {todayAttendance.check_out_time && (
                    <p className="text-xs text-indigo-600 mt-1">{new Date(todayAttendance.check_out_time).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}</p>
              )}
                </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Face Verification Camera */}
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

      {/* Processing Modal */}
      {showProcessingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 max-w-xs sm:max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-full animate-pulse opacity-50"></div>
                  </div>
              </div>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Memproses Hasil Verifikasi
              </h3>
              
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Mohon tunggu sebentar, kami sedang memproses data verifikasi wajah Anda...
              </p>
              
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
          employeeData={employee ? {
            full_name: employee.full_name,
            employee_code: employee.employee_code,
            position: employee.position,
            avatar_url: employee.avatar_url
          } : undefined}
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
          onRetry={() => {
            setShowResultModal(false);
            setVerificationResult(null);
            setShowCamera(true);
          }}
        />
      )}
    </div>
  );
}
