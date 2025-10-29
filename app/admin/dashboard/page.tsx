'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar, { SidebarToggleButton } from '@/components/AdminSidebar';

export default function AdminDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    todaysAttendance: 0,
    pendingCheckouts: 0,
    onTimeToday: 0,
    lateToday: 0,
  });
  const [todayEmployees, setTodayEmployees] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

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

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const employeesRes = await fetch('/api/employees');
      const employeesData = await employeesRes.json();
      
      const attendanceRes = await fetch('/api/attendance/today');
      const attendanceData = await attendanceRes.json();

      if (employeesData.success && attendanceData.success) {
        const totalEmployees = employeesData.data.length;
        const activeEmployees = employeesData.data.filter((e: any) => e.is_active).length;
        const todaysAttendance = attendanceData.data.length;
        const pendingCheckouts = attendanceData.data.filter((a: any) => !a.check_out_time).length;
        
        const onTimeToday = attendanceData.data.filter((a: any) => {
          if (!a.check_in_time) return false;
          const checkInTime = new Date(a.check_in_time).getHours() * 60 + new Date(a.check_in_time).getMinutes();
          const workStartTime = 9 * 60;
          return checkInTime <= workStartTime;
        }).length;
        const lateToday = todaysAttendance - onTimeToday;

        setStats({
          totalEmployees,
          activeEmployees,
          todaysAttendance,
          pendingCheckouts,
          onTimeToday,
          lateToday,
        });

        const employeesWithAttendance = employeesData.data.map((emp: any) => {
          const attendance = attendanceData.data.find((att: any) => att.employee_id === emp.id);
          return {
            ...emp,
            attendance: attendance || null,
          };
        });
        setTodayEmployees(employeesWithAttendance.slice(0, 8));

        const sortedActivities = [...attendanceData.data]
          .sort((a: any, b: any) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime())
          .slice(0, 10);
        setRecentActivities(sortedActivities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/admin');
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (attendance: any) => {
    if (!attendance) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
          <span>⏳</span>
          <span className="hidden sm:inline">Belum</span>
        </span>
      );
    }
    if (attendance.check_out_time) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
          <span>✓</span>
          <span className="hidden sm:inline">Selesai</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
        <span>●</span>
        <span className="hidden sm:inline">Hadir</span>
      </span>
    );
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="lg:ml-64 min-h-screen">
      {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Toggle + Icon + Title */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <SidebarToggleButton onClick={() => setIsSidebarOpen(true)} />
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">Dashboard</h1>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">{currentDate}</p>
                </div>
              </div>
              
              {/* Right: Logout Button */}
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 hover:text-red-700 text-sm font-semibold transition-all flex items-center gap-2 flex-shrink-0"
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
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Quick Stats - Compact & Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Card 1: Total Karyawan */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 text-xs font-medium">Total Karyawan</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.totalEmployees}</p>
                  </div>
        </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Aktif: <span className="font-semibold text-slate-700">{stats.activeEmployees}</span></p>
                </div>
              </div>

              {/* Card 2: Absensi Hari Ini */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 text-xs font-medium">Absensi Hari Ini</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.todaysAttendance}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Tepat Waktu: <span className="font-semibold text-green-600">{stats.onTimeToday}</span></p>
                </div>
              </div>

              {/* Card 3: Belum Check-out */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 text-xs font-medium">Belum Check-out</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.pendingCheckouts}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Terlambat: <span className="font-semibold text-amber-600">{stats.lateToday}</span></p>
                </div>
              </div>
            </div>

            {/* Karyawan Hari Ini & Aktivitas Terbaru - 2 Kolom Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Karyawan Hari Ini */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Karyawan Hari Ini</span>
                  </h2>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                    {todayEmployees.length}
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-2.5 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {todayEmployees.length > 0 ? (
                    todayEmployees.map((emp: any) => (
                      <div key={emp.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all border border-slate-100">
                        {/* Avatar & Info */}
                        {emp.avatar_url ? (
                          <img 
                            src={emp.avatar_url} 
                            alt={emp.full_name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm border-2 border-white"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                            {emp.full_name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">{emp.full_name}</p>
                          <p className="text-xs text-slate-500">{emp.employee_code}</p>
                        </div>
                        
                        {/* Time & Status */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-semibold text-slate-900">{emp.attendance ? formatTime(emp.attendance.check_in_time) : '-'}</p>
                          </div>
                          {getStatusBadge(emp.attendance)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-sm">Belum ada karyawan check-in</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Aktivitas Terbaru */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Aktivitas Terbaru</span>
                  </h2>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                    {recentActivities.length}
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-2.5 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all border border-slate-100">
                        {/* Icon Indicator */}
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {activity.check_out_time ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            )}
                          </svg>
                        </div>
                        
                        {/* Activity Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {activity.employee_name || 'Karyawan'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {activity.check_out_time ? 'Check-out' : 'Check-in'} · {formatTime(activity.check_in_time)}
                          </p>
                        </div>
                        
                        {/* Status Badge Small */}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                          activity.check_out_time 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {activity.check_out_time ? '✓' : '●'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">Belum ada aktivitas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
      </main>
      </div>
    </div>
  );
}
