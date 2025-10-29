'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar, { SidebarToggleButton } from '@/components/AdminSidebar';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in_time: string;
  check_out_time?: string;
  check_in_latitude?: number;
  check_in_longitude?: number;
  status: string;
  face_match_score?: number;
  employees: {
    full_name: string;
    employee_code: string;
    avatar_url?: string;
  };
}

export default function AttendancePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/admin');
  };

  useEffect(() => {
    checkAuth();
    fetchAttendance();
  }, [filter]);

  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/admin');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/user/dashboard');
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/attendance/history');
      const data = await response.json();
      
      if (data.success) {
        let filteredData = data.data;
        
        const now = new Date();
        
        if (filter === 'today') {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          filteredData = filteredData.filter((record: AttendanceRecord) => {
            const recordDate = new Date(record.check_in_time);
            return recordDate >= today;
          });
        } else if (filter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredData = filteredData.filter((record: AttendanceRecord) => {
            return new Date(record.check_in_time) >= weekAgo;
          });
        } else if (filter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredData = filteredData.filter((record: AttendanceRecord) => {
            return new Date(record.check_in_time) >= monthAgo;
          });
        }
        
        setAttendance(filteredData);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'present':
        return { label: 'Hadir', color: 'green', icon: '✓' };
      case 'late':
        return { label: 'Terlambat', color: 'yellow', icon: '⏰' };
      default:
        return { label: 'Absen', color: 'red', icon: '✕' };
    }
  };

  const handleViewDetail = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    late: attendance.filter(a => a.status === 'late').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    checkOut: attendance.filter(a => a.check_out_time).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat data absensi...</p>
        </div>
      </div>
    );
  }

  const getInitials = (email: string) => {
    if (!email) return 'A';
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />


      <div className="lg:ml-64 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Page Title */}
            <div className="flex items-center gap-3 flex-1 lg:flex-none">
              <SidebarToggleButton onClick={() => setIsSidebarOpen(true)} />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span>Laporan Absensi</span>
              </h2>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 hover:text-red-700 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-green-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Hadir</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-yellow-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Terlambat</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.late}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-red-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Absen</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-indigo-200 hover:shadow-md transition-all col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Check-Out</p>
                <p className="text-xl sm:text-2xl font-bold text-indigo-600">{stats.checkOut}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-2 shadow-sm border border-slate-200">
            <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setFilter('today')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              filter === 'today'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setFilter('week')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              filter === 'week'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setFilter('month')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              filter === 'month'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setFilter('all')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              filter === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua
          </button>
            </div>
          </div>
        </div>

        {/* Attendance List */}
          {attendance.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tidak Ada Data</h3>
            <p className="text-slate-500">Belum ada data absensi untuk periode ini</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {attendance.map((record) => {
              const statusInfo = getStatusInfo(record.status);
              const checkIn = formatDateTime(record.check_in_time);
              const checkOut = record.check_out_time ? formatDateTime(record.check_out_time) : null;
              
              return (
                <div key={record.id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all overflow-hidden">
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col gap-3">
                      {/* Employee Info with Status Badge - MOBILE & DESKTOP */}
                      <div className="flex items-start sm:items-center gap-3">
                        {record.employees.avatar_url ? (
                          <img 
                            src={record.employees.avatar_url} 
                            alt={record.employees.full_name}
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover shadow-sm border-2 border-white flex-shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-sm flex-shrink-0">
                            {record.employees.full_name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{record.employees.full_name}</h3>
                          <p className="text-xs text-slate-500">{record.employees.employee_code}</p>
                  </div>
                        {/* Status Badge - Always beside name */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold border flex-shrink-0 ${
                          statusInfo.color === 'green' 
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : statusInfo.color === 'yellow'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          <span>{statusInfo.icon}</span>
                          <span className="hidden sm:inline">{statusInfo.label}</span>
                  </span>
                </div>
                
                      {/* Time Info & Action Button */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        {/* Check In & Check Out - Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                          {/* Check In */}
                          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                              </svg>
                              <p className="text-xs text-slate-500 font-medium">Check-In</p>
                            </div>
                            <p className="text-sm font-bold text-slate-900">{checkIn.time}</p>
                            <p className="text-xs text-slate-500">{checkIn.date}</p>
                          </div>

                          {/* Check Out */}
                          <div className={`rounded-lg p-2.5 border ${checkOut ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <svg className={`w-3.5 h-3.5 flex-shrink-0 ${checkOut ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <p className="text-xs text-slate-500 font-medium">Check-Out</p>
                            </div>
                            {checkOut ? (
                              <>
                                <p className="text-sm font-bold text-slate-900">{checkOut.time}</p>
                                <p className="text-xs text-slate-500">{checkOut.date}</p>
                              </>
                            ) : (
                              <p className="text-sm text-slate-400">Belum</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <button
                          onClick={() => handleViewDetail(record)}
                          className="w-full sm:w-auto px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-600 hover:text-blue-700 text-sm font-semibold transition-all flex items-center justify-center gap-2 group/btn flex-shrink-0"
                        >
                          <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Detail</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal - Redesigned Compact & Professional */}
        {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            {/* Header - Compact */}
            <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {selectedRecord.employees.avatar_url ? (
                    <img 
                      src={selectedRecord.employees.avatar_url} 
                      alt={selectedRecord.employees.full_name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-white/40 shadow-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                      {selectedRecord.employees.full_name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-white truncate">{selectedRecord.employees.full_name}</h2>
                    <p className="text-xs text-white/80 truncate">{selectedRecord.employees.employee_code}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content - Compact */}
            <div className="p-4 sm:p-5 bg-slate-50 space-y-3">
              {/* Status & Score - Horizontal on mobile, Grid on larger */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium mb-1.5">Status Kehadiran</p>
                  {(() => {
                    const info = getStatusInfo(selectedRecord.status);
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        info.color === 'green' 
                          ? 'bg-green-100 text-green-700'
                          : info.color === 'yellow'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </span>
                    );
                  })()}
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium mb-1.5">Skor Verifikasi</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">
                    {selectedRecord.face_match_score 
                      ? `${selectedRecord.face_match_score.toFixed(1)}%`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* Time Details - Compact */}
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Check In */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">Check-In</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-0.5">
                      {formatDateTime(selectedRecord.check_in_time).time}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(selectedRecord.check_in_time).date}
                    </p>
        </div>

                  {/* Check Out */}
                        <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedRecord.check_out_time ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                        <svg className={`w-4 h-4 ${selectedRecord.check_out_time ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">Check-Out</p>
                        </div>
                    {selectedRecord.check_out_time ? (
                      <>
                        <p className="text-sm font-bold text-slate-900 mb-0.5">
                          {formatDateTime(selectedRecord.check_out_time).time}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(selectedRecord.check_out_time).date}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Belum check-out</p>
                    )}
                  </div>
          </div>
        </div>

              {/* Location - Compact */}
              {(selectedRecord.check_in_latitude && selectedRecord.check_in_longitude) && (
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xs text-slate-500 font-semibold">Lokasi Check-In</p>
          </div>
                  <p className="text-xs text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    {selectedRecord.check_in_latitude.toFixed(6)}, {selectedRecord.check_in_longitude.toFixed(6)}
            </p>
          </div>
              )}
            </div>

            {/* Footer - Compact */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-lg transition-all text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
        )}
        </div>
      </main>
      </div>
    </div>
  );
}
