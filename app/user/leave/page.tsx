'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserSidebar, { SidebarToggleButton } from '@/components/UserSidebar';

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: 'sick' | 'annual' | 'personal' | 'emergency';
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  attachment_url?: string;
  admin_notes?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
}

export default function UserLeavePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'sick' as 'sick' | 'annual' | 'personal' | 'emergency',
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/user');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'user') {
      router.push('/admin/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchEmployeeData(parsedUser.email);
  }, [router]);

  const fetchEmployeeData = async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employees?email=${email}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setEmployee(data.data[0]);
        // Fetch leave requests from API
        await fetchLeaveRequests(data.data[0].user_id);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRequests = async (userId: string) => {
    try {
      const response = await fetch(`/api/leave-requests?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaveRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      // Calculate difference in days
      // 30 Oct to 31 Oct = 1 day (not 2)
      // Same day = 1 day
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      // If same day (diff = 0), count as 1 day
      // If different days, count the difference
      return diffDays === 0 ? 1 : (diffDays > 0 ? diffDays : 0);
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Data user tidak ditemukan');
      return;
    }

    const days = calculateDays();
    if (days <= 0) {
      alert('Tanggal tidak valid');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Pengajuan izin berhasil dikirim!');
        setShowFormModal(false);
        setFormData({
          leave_type: 'sick',
          start_date: '',
          end_date: '',
          reason: '',
        });
        // Refresh leave requests
        await fetchLeaveRequests(user.id);
      } else {
        alert('❌ Gagal mengirim pengajuan: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('❌ Terjadi kesalahan saat mengirim pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sick': return { text: 'Sakit', icon: '🤒', color: 'red' };
      case 'annual': return { text: 'Cuti Tahunan', icon: '🏖️', color: 'blue' };
      case 'personal': return { text: 'Izin Pribadi', icon: '📝', color: 'yellow' };
      case 'emergency': return { text: 'Darurat', icon: '🚨', color: 'orange' };
      default: return { text: type, icon: '📄', color: 'gray' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: '⏳', text: 'Menunggu', bgClass: 'bg-yellow-500 text-white' };
      case 'approved':
        return { icon: '✅', text: 'Disetujui', bgClass: 'bg-green-500 text-white' };
      case 'rejected':
        return { icon: '❌', text: 'Ditolak', bgClass: 'bg-red-500 text-white' };
      default:
        return { icon: '●', text: status, bgClass: 'bg-gray-500 text-white' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length,
  };

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
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">Pengajuan Izin</h1>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">Ajukan izin/cuti Anda</p>
                </div>
              </div>

              <button
                onClick={() => setShowFormModal(true)}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Ajukan Izin</span>
                <span className="sm:hidden">Baru</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Total</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Menunggu</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Disetujui</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Ditolak</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.rejected}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Requests List */}
          {loading ? (
            <div className="bg-white rounded-xl sm:rounded-2xl p-12 text-center shadow-sm border border-slate-200">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Memuat data...</p>
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-sm border border-slate-200">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Belum Ada Pengajuan</h3>
              <p className="text-sm sm:text-base text-slate-500 mb-6">Klik tombol "Ajukan Izin" untuk membuat pengajuan baru</p>
              <button
                onClick={() => setShowFormModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajukan Izin Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {leaveRequests.map((request) => {
                const typeInfo = getTypeLabel(request.leave_type);
                const statusInfo = getStatusInfo(request.status);
                return (
                  <div key={request.id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-purple-200 transition-all overflow-hidden group">
                    {/* Card Header with Gradient */}
                    <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="text-2xl">{typeInfo.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-white truncate">{typeInfo.text}</h3>
                            <p className="text-xs text-white/80 truncate">{request.days} hari</p>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm flex-shrink-0 ${statusInfo.bgClass}`}>
                          <span className="text-xs">{statusInfo.icon}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 sm:p-4 space-y-2.5">
                      {/* Dates - 2 Columns */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
                          <p className="text-xs text-slate-500 font-medium mb-0.5">Mulai</p>
                          <p className="text-xs text-slate-900 truncate font-medium">{new Date(request.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                        </div>
                        <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
                          <p className="text-xs text-slate-500 font-medium mb-0.5">Selesai</p>
                          <p className="text-xs text-slate-900 truncate font-medium">{new Date(request.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium mb-1">Alasan</p>
                        <p className="text-xs text-slate-700 line-clamp-2">{request.reason}</p>
                      </div>

                      {/* Admin Notes (if rejected or approved) */}
                      {request.admin_notes && (
                        <div className="bg-indigo-50 rounded-md p-2 border border-indigo-200">
                          <p className="text-xs text-indigo-600 font-medium mb-1">Catatan Admin</p>
                          <p className="text-xs text-indigo-700 line-clamp-2">{request.admin_notes}</p>
                        </div>
                      )}

                      {/* Submitted Date */}
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                          Diajukan: {formatDate(request.created_at)}
                        </p>
                        {request.reviewed_at && (
                          <p className="text-xs text-slate-500 mt-1">
                            Direview: {formatDate(request.reviewed_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" onClick={() => setShowFormModal(false)}>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto custom-scrollbar animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ajukan Izin Baru
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-slate-700 mb-2 text-sm font-semibold">
                  Jenis Izin
                </label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  required
                >
                  <option value="sick">🤒 Sakit</option>
                  <option value="annual">🏖️ Cuti Tahunan</option>
                  <option value="personal">📝 Izin Pribadi</option>
                  <option value="emergency">🚨 Darurat</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-2 text-sm font-semibold">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-2 text-sm font-semibold">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
              </div>

              {/* Duration */}
              {formData.start_date && formData.end_date && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-700">
                    <strong>Durasi:</strong> {calculateDays()} hari
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-slate-700 mb-2 text-sm font-semibold">
                  Alasan
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  rows={4}
                  placeholder="Jelaskan alasan pengajuan izin Anda..."
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Ajukan
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl border border-slate-300 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

