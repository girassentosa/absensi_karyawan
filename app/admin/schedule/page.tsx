'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar, { SidebarToggleButton } from '@/components/AdminSidebar';

interface WorkSchedule {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'national' | 'company';
}

interface Policy {
  id: string;
  title: string;
  description: string;
  category: 'attendance' | 'leave' | 'general';
}

export default function SchedulePolicyPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'holidays' | 'policies'>('schedule');
  
  // Schedule State
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule[]>([
    { id: '1', day: 'Senin', start_time: '09:00', end_time: '17:00', is_active: true },
    { id: '2', day: 'Selasa', start_time: '09:00', end_time: '17:00', is_active: true },
    { id: '3', day: 'Rabu', start_time: '09:00', end_time: '17:00', is_active: true },
    { id: '4', day: 'Kamis', start_time: '09:00', end_time: '17:00', is_active: true },
    { id: '5', day: 'Jumat', start_time: '09:00', end_time: '17:00', is_active: true },
    { id: '6', day: 'Sabtu', start_time: '09:00', end_time: '13:00', is_active: false },
    { id: '7', day: 'Minggu', start_time: '00:00', end_time: '00:00', is_active: false },
  ]);

  // Holidays State
  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: '1', name: 'Tahun Baru 2025', date: '2025-01-01', type: 'national' },
    { id: '2', name: 'Imlek', date: '2025-01-29', type: 'national' },
    { id: '3', name: 'Nyepi', date: '2025-03-22', type: 'national' },
    { id: '4', name: 'Waisak', date: '2025-05-12', type: 'national' },
    { id: '5', name: 'Anniversary Perusahaan', date: '2025-06-15', type: 'company' },
  ]);

  // Policies State
  const [policies, setPolicies] = useState<Policy[]>([
    { 
      id: '1', 
      title: 'Toleransi Keterlambatan', 
      description: 'Keterlambatan maksimal 15 menit tanpa potongan. Lebih dari 15 menit akan mendapat peringatan.',
      category: 'attendance'
    },
    { 
      id: '2', 
      title: 'Cuti Tahunan', 
      description: 'Setiap karyawan berhak mendapat 12 hari cuti tahunan yang bisa diambil setelah masa kerja 1 tahun.',
      category: 'leave'
    },
    { 
      id: '3', 
      title: 'Cuti Sakit', 
      description: 'Cuti sakit dengan surat dokter maksimal 3 hari berturut-turut tanpa potongan gaji.',
      category: 'leave'
    },
    { 
      id: '4', 
      title: 'Dress Code', 
      description: 'Senin-Kamis: Formal (kemeja + celana bahan). Jumat: Smart Casual.',
      category: 'general'
    },
  ]);

  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/admin');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/admin');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/user/dashboard');
      return;
    }
  }, [router]);

  const handleUpdateSchedule = (id: string, field: 'start_time' | 'end_time' | 'is_active', value: any) => {
    setWorkSchedule(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSaveSchedule = () => {
    alert('✅ Jadwal kerja berhasil disimpan!');
    console.log('Saved schedule:', workSchedule);
  };

  const handleDeleteHoliday = (id: string) => {
    if (confirm('Hapus hari libur ini?')) {
      setHolidays(prev => prev.filter(h => h.id !== id));
    }
  };

  const handleDeletePolicy = (id: string) => {
    if (confirm('Hapus kebijakan ini?')) {
      setPolicies(prev => prev.filter(p => p.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>Jadwal & Kebijakan</span>
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

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-2 shadow-sm border border-slate-200">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="hidden sm:inline">⏰ Jadwal</span>
                <span className="sm:hidden">Jadwal</span>
              </button>
              <button
                onClick={() => setActiveTab('holidays')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'holidays'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="hidden sm:inline">🏖️ Libur</span>
                <span className="sm:hidden">Libur</span>
              </button>
              <button
                onClick={() => setActiveTab('policies')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'policies'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="hidden sm:inline">📋 Kebijakan</span>
                <span className="sm:hidden">Kebijakan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Jadwal Kerja Mingguan</span>
              </h2>
              <button
                onClick={handleSaveSchedule}
                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Simpan Perubahan</span>
                <span className="sm:hidden">Simpan</span>
              </button>
            </div>

            <div className="space-y-3">
              {workSchedule.map((schedule) => (
                <div key={schedule.id} className={`rounded-lg sm:rounded-xl p-4 border transition-all ${
                  schedule.is_active 
                    ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Day & Toggle Switch */}
                    <div className="flex items-center justify-between sm:w-52">
                      <p className="text-slate-900 font-semibold text-sm sm:text-base flex items-center gap-2">
                        {schedule.day}
                        {schedule.is_active && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                            ✓
                          </span>
                        )}
                      </p>
                      
                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleUpdateSchedule(schedule.id, 'is_active', !schedule.is_active)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          schedule.is_active 
                            ? 'bg-green-500 focus:ring-green-500' 
                            : 'bg-slate-300 focus:ring-slate-400'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            schedule.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 sm:w-20">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        schedule.is_active
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-slate-200 text-slate-600 border border-slate-300'
                      }`}>
                        {schedule.is_active ? (
                          <>
                            <span>●</span>
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <span>○</span>
                            <span>Libur</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Time Inputs */}
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="time"
                        value={schedule.start_time}
                        onChange={(e) => handleUpdateSchedule(schedule.id, 'start_time', e.target.value)}
                        disabled={!schedule.is_active}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                      <span className="text-slate-400 font-bold">-</span>
                      <input
                        type="time"
                        value={schedule.end_time}
                        onChange={(e) => handleUpdateSchedule(schedule.id, 'end_time', e.target.value)}
                        disabled={!schedule.is_active}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  Jadwal ini akan digunakan untuk menghitung keterlambatan dan lembur karyawan. Pastikan jam kerja sudah benar sebelum disimpan.
                </span>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'holidays' && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Daftar Hari Libur</span>
              </h2>
              <button
                onClick={() => setShowAddHolidayModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Libur
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {holidays.map((holiday) => (
                <div key={holiday.id} className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-slate-900 font-bold text-base mb-1">{holiday.name}</h3>
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(holiday.date)}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600 flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border ${
                    holiday.type === 'national' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}>
                    <span>{holiday.type === 'national' ? '🇮🇩' : '🏢'}</span>
                    <span>{holiday.type === 'national' ? 'Nasional' : 'Perusahaan'}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Kebijakan Perusahaan</span>
              </h2>
              <button
                onClick={() => setShowAddPolicyModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Kebijakan
              </button>
            </div>

            <div className="space-y-4">
              {policies.map((policy) => (
                <div key={policy.id} className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-slate-900 font-bold text-base sm:text-lg">{policy.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border ${
                          policy.category === 'attendance' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : policy.category === 'leave'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          <span>{policy.category === 'attendance' ? '⏰' : policy.category === 'leave' ? '🏖️' : '📋'}</span>
                          <span>{policy.category === 'attendance' ? 'Absensi' : policy.category === 'leave' ? 'Cuti' : 'Umum'}</span>
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{policy.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600 flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </main>
      </div>
    </div>
  );
}
