'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  };
}

export default function AttendancePage() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');

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
      router.push('/user/attendance');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-white hover:text-white/80 text-sm sm:text-base"
            >
              ← Kembali
            </button>
            <h1 className="text-lg sm:text-2xl font-bold text-white">Lihat Absensi</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-4 sm:mb-6 grid grid-cols-2 sm:flex gap-2 sm:gap-4">
          <button
            onClick={() => setFilter('today')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${
              filter === 'today'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${
              filter === 'week'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${
              filter === 'month'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${
              filter === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            Semua
          </button>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {attendance.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center text-white/60">
              Tidak ada data absensi
            </div>
          ) : (
            attendance.map((record) => (
              <div key={record.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{record.employees.full_name}</h3>
                    <p className="text-white/60 text-sm">{record.employees.employee_code}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    record.status === 'present'
                      ? 'bg-green-500/20 text-green-300'
                      : record.status === 'late'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {record.status === 'present' ? 'Hadir' : record.status === 'late' ? 'Terlambat' : 'Absen'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Check-In:</span>
                    <span className="text-white">
                      {new Date(record.check_in_time).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Check-Out:</span>
                    <span className="text-white">
                      {record.check_out_time 
                        ? new Date(record.check_out_time).toLocaleString('id-ID')
                        : '-'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Skor Wajah:</span>
                    <span className="text-white">
                      {record.face_match_score ? `${record.face_match_score.toFixed(1)}%` : '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Karyawan</th>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Check-In</th>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Check-Out</th>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Status</th>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Skor Wajah</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 xl:px-6 py-8 text-center text-white/60">
                      Tidak ada data absensi
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-4 xl:px-6 py-4 text-white">
                        <div>
                          <p className="font-semibold text-sm xl:text-base">{record.employees.full_name}</p>
                          <p className="text-xs xl:text-sm text-white/60">{record.employees.employee_code}</p>
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-4 text-white/80 text-sm xl:text-base">
                        {new Date(record.check_in_time).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 xl:px-6 py-4 text-white/80 text-sm xl:text-base">
                        {record.check_out_time
                          ? new Date(record.check_out_time).toLocaleString('id-ID')
                          : '-'}
                      </td>
                      <td className="px-4 xl:px-6 py-4">
                        <span className={`px-2 xl:px-3 py-1 rounded-full text-xs xl:text-sm ${
                          record.status === 'present'
                            ? 'bg-green-500/20 text-green-300'
                            : record.status === 'late'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {record.status === 'present' ? 'Hadir' : record.status === 'late' ? 'Terlambat' : 'Absen'}
                        </span>
                      </td>
                      <td className="px-4 xl:px-6 py-4 text-white/80 text-sm xl:text-base">
                        {record.face_match_score
                          ? `${record.face_match_score.toFixed(1)}%`
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <p className="text-white/60 text-sm mb-2">Total Absensi</p>
            <p className="text-3xl font-bold text-white">{attendance.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <p className="text-white/60 text-sm mb-2">Hadir</p>
            <p className="text-3xl font-bold text-green-400">
              {attendance.filter((a) => a.status === 'present').length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <p className="text-white/60 text-sm mb-2">Terlambat</p>
            <p className="text-3xl font-bold text-yellow-400">
              {attendance.filter((a) => a.status === 'late').length}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

