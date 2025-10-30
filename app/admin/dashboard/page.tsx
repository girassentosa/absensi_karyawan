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
  const [activityFilter, setActivityFilter] = useState<'all' | 'onTime' | 'within' | 'beyond' | 'leave'>('all');
  const [employeesMap, setEmployeesMap] = useState<Record<string, any>>({});
  const [leavesToday, setLeavesToday] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any>(null);
  const [isHoliday, setIsHoliday] = useState<boolean>(false);
  const [activeOffice, setActiveOffice] = useState<any>(null);
  const [distanceToOffice, setDistanceToOffice] = useState<number | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [kpiToday, setKpiToday] = useState({
    present: 0,
    onTime: 0,
    withinTolerance: 0,
    lateBeyond: 0,
    leaveCount: 0,
  });
  const [kpiWeek, setKpiWeek] = useState({
    presencePercent: 0,
    avgLateMinutes: 0,
  });
  const [miniChart, setMiniChart] = useState<{ label: string; percent: number }[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const filteredActivities = recentActivities.filter((a: any) => activityFilter === 'all' ? true : a._category === activityFilter);

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

    (async () => {
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchTodayScheduleAndHoliday(),
          fetchActiveOffice(),
          fetchKpis(),
        ]);
      } catch (e) {
        setToast({ type: 'error', message: 'Gagal memuat dashboard' });
      } finally {
        setLoadingDashboard(false);
        setTimeout(() => setToast(null), 3000);
      }
    })();
    return () => {};
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const employeesRes = await fetch('/api/employees');
      const employeesData = await employeesRes.json();
      
      const attendanceRes = await fetch('/api/attendance/today');
      const attendanceData = await attendanceRes.json();

      if (employeesData.success && attendanceData.success) {
        // Ensure schedule context is available locally to avoid race with state
        let startStrLocal: string | null = null;
        let toleranceLocal: number = 0;
        try {
          const schedulesRes = await fetch('/api/work-schedules');
          const schedulesJson = await schedulesRes.json();
          if (schedulesJson?.success) {
            const dowNow = new Date().getDay();
            const todaySch = (schedulesJson.data || []).find((d: any) => d.day_of_week === dowNow && d.is_active !== false);
            if (todaySch) {
              startStrLocal = todaySch.start_time;
              toleranceLocal = todaySch.late_tolerance_minutes || 0;
            }
          }
        } catch {}
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

        const empMap: Record<string, any> = {};
        for (const emp of employeesData.data) empMap[emp.id] = emp;
        setEmployeesMap(empMap);

        const employeesWithAttendance = employeesData.data.map((emp: any) => {
          const attendance = attendanceData.data.find((att: any) => att.employee_id === emp.id);
          return {
            ...emp,
            attendance: attendance || null,
          };
        });
        setTodayEmployees(employeesWithAttendance.slice(0, 8));

        // Build activity list with classification and employee info
        let todayScheduleLocal: any = null;
        try {
          const schedulesRes = await fetch('/api/work-schedules');
          const schedulesJson = await schedulesRes.json();
          if (schedulesJson?.success) {
            // Get day of week in Asia/Jakarta timezone
            const now = new Date();
            const jakartaDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
            const dowNow = jakartaDate.getDay();
            todayScheduleLocal = (schedulesJson.data || []).find((d: any) => d.day_of_week === dowNow && d.is_active !== false);
          }
        } catch {}
        
        const classified = attendanceData.data.map((a: any) => {
          const emp = empMap[a.employee_id] || {};
          let category: 'onTime' | 'within' | 'beyond' = 'onTime';
          if (a.check_in_time && todayScheduleLocal) {
            category = classifyAttendanceTime(new Date(a.check_in_time), todayScheduleLocal);
          }
          return { ...a, employee: emp, _category: category };
        });

        // Fetch today's approved leaves to include in activity stream (Asia/Jakarta)
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        try {
          const leaveRes = await fetch(`/api/leave-requests?status=approved&date=${todayStr}`);
          const leaveJson = await leaveRes.json();
          const lr = (leaveJson?.data || []).map((r: any) => ({ ...r, _category: 'leave' }));
          setLeavesToday(lr);
          setRecentActivities([...classified, ...lr]
            .sort((a: any, b: any) => new Date(b.check_in_time || b.created_at).getTime() - new Date(a.check_in_time || a.created_at).getTime())
            .slice(0, 20));
        } catch {
          setLeavesToday([]);
          setRecentActivities(classified
            .sort((a: any, b: any) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime())
            .slice(0, 20));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setToast({ type: 'error', message: 'Gagal memuat data karyawan/absensi' });
    }
  };

  const fetchTodayScheduleAndHoliday = async () => {
    try {
      const wsRes = await fetch('/api/work-schedules');
      const wsData = await wsRes.json();
      if (wsData.success) {
        // Get day of week in Asia/Jakarta timezone
        const now = new Date();
        const jakartaDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        const dow = jakartaDate.getDay(); // 0..6
        const schedule = wsData.data.find((d: any) => d.day_of_week === dow);
        setTodaySchedule(schedule || null);
      }

      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
      const hRes = await fetch(`/api/holidays?date=${todayStr}`);
      const hData = await hRes.json();
      setIsHoliday(hData.success && Array.isArray(hData.data) && hData.data.some((h: any) => h.is_active !== false));
    } catch (e) {
      console.error('Error fetching schedule/holiday', e);
      setToast({ type: 'error', message: 'Gagal memuat jadwal/libur' });
    }
  };

  const fetchActiveOffice = async () => {
    try {
      const res = await fetch('/api/office-locations');
      const data = await res.json();
      if (data.success) {
        const act = (data.data || []).find((l: any) => l.is_active);
        setActiveOffice(act || null);
        if (act && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setDistanceToOffice(haversineDistance(
                { lat: pos.coords.latitude, lon: pos.coords.longitude },
                { lat: act.latitude, lon: act.longitude }
              ));
            },
            () => {},
            { enableHighAccuracy: true, timeout: 8000 }
          );
        }
      }
    } catch (e) {
      console.error('Error fetching office location', e);
    }
  };

  const haversineDistance = (
    a: { lat: number; lon: number },
    b: { lat: number; lon: number }
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
    return Math.round(R * c);
  };

  const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    const hh = parseInt(parts[0] || '0');
    const mm = parseInt(parts[1] || '0');
    return hh * 60 + mm;
  };

  const minutesFromDate = (iso: string) => {
    const d = new Date(iso);
    return d.getHours() * 60 + d.getMinutes();
  };

  const isSameDay = (a: Date, b: Date) => {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  // Helper: Classify check-in time using flexible time ranges from schedule
  const classifyAttendanceTime = (checkInTime: Date, schedule: any): 'onTime' | 'within' | 'beyond' => {
    if (!schedule || !checkInTime) return 'onTime';
    
    const checkInMin = checkInTime.getHours() * 60 + checkInTime.getMinutes();
    const startMin = parseTimeToMinutes(schedule.start_time) || 0;
    
    // Get time ranges from database (or calculate fallback)
    let onTimeEndMin: number;
    if (schedule.on_time_end_time) {
      onTimeEndMin = parseTimeToMinutes(schedule.on_time_end_time) || startMin;
    } else {
      const tol = schedule.late_tolerance_minutes || 0;
      onTimeEndMin = startMin + tol;
    }
    
    let toleranceStartMin: number;
    if (schedule.tolerance_start_time) {
      toleranceStartMin = parseTimeToMinutes(schedule.tolerance_start_time) || onTimeEndMin;
    } else {
      toleranceStartMin = onTimeEndMin;
    }
    
    let toleranceEndMin: number;
    if (schedule.tolerance_end_time) {
      toleranceEndMin = parseTimeToMinutes(schedule.tolerance_end_time) || toleranceStartMin;
    } else {
      const tol = schedule.late_tolerance_minutes || 0;
      toleranceEndMin = toleranceStartMin + tol;
    }
    
    // Classify
    if (checkInMin >= startMin && checkInMin <= onTimeEndMin) {
      return 'onTime';
    } else if (checkInMin > onTimeEndMin && checkInMin <= toleranceEndMin) {
      return 'within';
    } else {
      return 'beyond';
    }
  };

  const fetchKpis = async () => {
    try {
      // Fetch base data
      const [employeesRes, attTodayRes, schedulesRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/attendance/today'),
        fetch('/api/work-schedules'),
      ]);
      const employeesData = await employeesRes.json();
      const attTodayData = await attTodayRes.json();
      const schedulesData = await schedulesRes.json();

      const activeEmployees = employeesData?.data?.filter((e: any) => e.is_active) || [];

      // Determine today's schedule (using Asia/Jakarta timezone)
      const now = new Date();
      const jakartaDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const dow = jakartaDate.getDay();
      const todaySch = schedulesData?.data?.find((d: any) => d.day_of_week === dow && d.is_active);

      const attToday = attTodayData?.data || [];

      // Compute onTime / withinTolerance / lateBeyond using flexible time ranges
      let onTime = 0, withinTol = 0, beyondTol = 0;
      for (const a of attToday) {
        if (!a.check_in_time || !todaySch) continue;
        const category = classifyAttendanceTime(new Date(a.check_in_time), todaySch);
        if (category === 'onTime') onTime++;
        else if (category === 'within') withinTol++;
        else beyondTol++;
      }

      // Leave requests today (approved) - local Asia/Jakarta
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
      const leaveRes = await fetch(`/api/leave-requests?status=approved&date=${todayStr}`);
      let leaveCount = 0;
      try {
        const leaveData = await leaveRes.json();
        const lr = (leaveData?.data || []).filter((r: any) => {
          const sd = new Date(r.start_date);
          const ed = new Date(r.end_date);
          const t = new Date(todayStr);
          return (t >= sd && t < ed) || isSameDay(t, sd) || isSameDay(t, ed);
        });
        leaveCount = lr.length;
      } catch {}

      setKpiToday({
        present: attToday.length,
        onTime,
        withinTolerance: withinTol,
        lateBeyond: beyondTol,
        leaveCount,
      });

      // Weekly KPIs
      const nowWeek = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(nowWeek.getDate() - 6);
      const histRes = await fetch('/api/attendance/history');
      const histData = await histRes.json();
      const history = (histData?.data || []).filter((a: any) => {
        const d = new Date(a.check_in_time || a.created_at || nowWeek);
        return d >= new Date(weekAgo.toDateString()) && d <= nowWeek;
      });

      // presencePercent: (unique employee-day attendances) / (activeEmployees * workingDaysInRange)
      // Approx working days: count days in [weekAgo..now] where schedule active and not holiday (skip holiday fetch for simplicity)
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) { const d = new Date(weekAgo); d.setDate(weekAgo.getDate() + i); days.push(d); }
      const workingDays = days.filter((d) => {
        const dow = d.getDay();
        return schedulesData?.data?.some((s: any) => s.day_of_week === dow && s.is_active);
      }).length || 1;

      const uniqueEmpDay = new Set<string>();
      for (const a of history) {
        const d = new Date(a.check_in_time || a.created_at);
        uniqueEmpDay.add(`${a.employee_id}-${d.toDateString()}`);
      }
      const denom = activeEmployees.length * workingDays || 1;
      const presencePercent = Math.max(0, Math.min(100, Math.round((uniqueEmpDay.size / denom) * 100)));

      // avgLateMinutes over week (only positive lateness)
      let lateMinsTotal = 0, lateCount = 0;
      for (const a of history) {
        if (!a.check_in_time) continue;
        const d = new Date(a.check_in_time);
        const s = schedulesData?.data?.find((x: any) => x.day_of_week === d.getDay() && x.is_active);
        if (!s) continue;
        const sMin = parseTimeToMinutes(s.start_time) || 0;
        const ciMin = d.getHours() * 60 + d.getMinutes();
        const diff = ciMin - sMin;
        if (diff > 0) { lateMinsTotal += diff; lateCount++; }
      }
      const avgLateMinutes = lateCount ? Math.round(lateMinsTotal / lateCount) : 0;

      setKpiWeek({ presencePercent, avgLateMinutes });

      // Build last 5 working-day mini chart (Mon-Fri style using active schedule days)
      const labelsMap = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const lastDays: { date: Date; dow: number }[] = [];
      let cursor = new Date(now);
      while (lastDays.length < 5) {
        const d = new Date(cursor);
        const dow = d.getDay();
        const isWorking = schedulesData?.data?.some((s: any) => s.day_of_week === dow && s.is_active);
        if (isWorking) {
          lastDays.unshift({ date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), dow });
        }
        cursor.setDate(cursor.getDate() - 1);
        if (lastDays.length < 5 && (now.getTime() - cursor.getTime()) > 14 * 24 * 60 * 60 * 1000) break; // safety bound
      }

      const chart: { label: string; percent: number }[] = lastDays.map(({ date, dow }) => {
        const attCount = history.filter((a: any) => {
          const ad = new Date(a.check_in_time || a.created_at || now);
          return ad.toDateString() === date.toDateString();
        }).length;
        const percent = activeEmployees.length ? Math.round((attCount / activeEmployees.length) * 100) : 0;
        return { label: labelsMap[dow], percent: Math.max(0, Math.min(100, percent)) };
      });
      setMiniChart(chart);
    } catch (e) {
      console.error('Error computing KPIs', e);
      setToast({ type: 'error', message: 'Gagal menghitung KPI' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
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
              
              {/* Right: (empty - logout moved to sidebar) */}
          </div>
        </div>
      </header>

      {/* Main Content */}
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {toast && (
              <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{toast.message}</div>
            )}
            {/* Quick Stats - Compact & Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Card 1: Total Karyawan */}
              <div className={`bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 transition-all group ${loadingDashboard ? 'animate-pulse' : 'hover:shadow-md'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 text-xs font-medium">Total Karyawan</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{loadingDashboard ? '—' : stats.totalEmployees}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Absensi Hari Ini */}
              <div className={`bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 transition-all group ${loadingDashboard ? 'animate-pulse' : 'hover:shadow-md'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 text-xs font-medium">Absensi Hari Ini</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{loadingDashboard ? '—' : kpiToday.present}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly KPI + Mini Chart side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Card: KPI Mingguan */}
              <div className={`bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 transition-all group ${loadingDashboard ? 'animate-pulse' : 'hover:shadow-md'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h13M9 11l3-3m0 6l-3 3M5 7h4M5 11h4M5 15h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 text-xs font-medium">Kehadiran Minggu Ini</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{loadingDashboard ? '—' : `${kpiWeek.presencePercent}%`}</p>
                  </div>
        </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Rata-rata Telat: <span className="font-semibold text-slate-700">{loadingDashboard ? '—' : `${kpiWeek.avgLateMinutes} menit`}</span></p>
                </div>
              </div>

              {/* Card: Statistik Kehadiran (5 Hari) */}
              {miniChart.length > 0 && (
                <div className="bg-white rounded-lg sm:rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">Statistik Kehadiran (5 Hari Kerja)</h3>
                    <span className="text-xs text-slate-500">Persentase hadir</span>
                  </div>
                  <div className="grid grid-cols-5 gap-3 items-end h-40">
                    {miniChart.map((d, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div className="w-full bg-slate-100 rounded-lg overflow-hidden h-full flex items-end">
                          <div className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-lg relative" style={{ height: `${d.percent}%` }}>
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-900 bg-white/80 backdrop-blur px-1.5 py-0.5 rounded">{d.percent}%</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{d.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { title: 'Tepat Waktu', value: loadingDashboard ? '—' : kpiToday.onTime, color: 'from-green-500 to-emerald-600' },
                { title: 'Dalam Toleransi', value: loadingDashboard ? '—' : kpiToday.withinTolerance, color: 'from-blue-500 to-indigo-600' },
                { title: 'Lewat Toleransi', value: loadingDashboard ? '—' : kpiToday.lateBeyond, color: 'from-amber-500 to-orange-600' },
                { title: 'Izin Hari Ini', value: loadingDashboard ? '—' : kpiToday.leaveCount, color: 'from-slate-600 to-slate-800' },
              ].map((k, i) => (
                <div key={i} className={`bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 ${loadingDashboard ? 'animate-pulse' : 'hover:shadow-md transition-all'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${k.color} rounded-lg flex items-center justify-center text-white font-bold`}>{typeof k.value === 'number' ? k.value : '—'}</div>
                    <div>
                      <p className="text-xs text-slate-500">Hari Ini</p>
                      <p className="text-sm font-semibold text-slate-900">{k.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Karyawan Hari Ini & Aktivitas Terbaru - 2 Kolom Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Karyawan Hari Ini */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
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
                <div className="mb-3 sm:mb-4">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-2 sm:mb-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Aktivitas Terbaru</span>
                  </h2>
                  {/* Filters: full-width 'Semua' on top (mobile), then 2x2 grid; inline on larger screens */}
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-1">
                    {[
                      { key: 'all', label: 'Semua' },
                      { key: 'onTime', label: 'Tepat Waktu' },
                      { key: 'within', label: 'Dalam Toleransi' },
                      { key: 'beyond', label: 'Lewat Toleransi' },
                      { key: 'leave', label: 'Izin' },
                    ].map((b: any) => (
                      <button key={b.key}
                        onClick={() => setActivityFilter(b.key)}
                        className={`${b.key === 'all' ? 'col-span-2' : ''} w-full sm:w-auto text-center px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${activityFilter === b.key ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-600 bg-white hover:bg-slate-50 border-slate-200'}`}
                        >{b.label}</button>
                    ))}
                  </div>
                </div>
                <div className={`space-y-2 sm:space-y-2.5 ${filteredActivities.length > 5 ? 'max-h-[360px] sm:max-h-[400px] overflow-y-auto custom-scrollbar' : ''}`}>
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity: any, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all border border-slate-100">
                        {/* Avatar */}
                        <div className="flex items-center gap-3">
                          {activity.employee?.avatar_url ? (
                            <img src={activity.employee.avatar_url} alt={activity.employee.full_name} className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-sm">{(activity.employee?.full_name || 'U').substring(0,1)}</div>
                          )}
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{activity.employee?.full_name || activity.employee_name || 'Karyawan'}</p>
                            <p className="text-xs text-slate-500 truncate">{activity.employee?.employee_code || activity.employee_code} • {activity.employee?.position || '—'}</p>
                          </div>
                        </div>
                        {/* Right: time + badge */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 w-full sm:w-auto">
                          <span className="text-xs text-slate-600 font-semibold">{activity.check_in_time ? formatTime(activity.check_in_time) : '-'}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            activity._category === 'onTime' ? 'bg-green-100 text-green-700' :
                            activity._category === 'within' ? 'bg-blue-100 text-blue-700' :
                            activity._category === 'beyond' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {activity._category === 'onTime' ? 'Tepat Waktu' : activity._category === 'within' ? 'Dalam Toleransi' : activity._category === 'beyond' ? 'Lewat Toleransi' : 'Izin'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">Tidak ada data untuk filter ini</p>
                        <p className="text-xs text-slate-500">Pilih kategori lain untuk melihat aktivitas</p>
                      </div>
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
