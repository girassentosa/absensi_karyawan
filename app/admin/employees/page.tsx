'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FaceTrainingCamera from '@/components/FaceTrainingCamera';

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  username?: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  is_active: boolean;
  face_encoding_path?: string;
  face_match_score?: number;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [trainingEmployee, setTrainingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    position: '',
  });

  useEffect(() => {
    checkAuth();
    fetchEmployees();
  }, []);

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

  const fetchEmployees = async () => {
    try {
      // Fetch ALL employees (both active and inactive) to show in admin panel
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/employees?showInactive=true&_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      const data = await response.json();
      if (data.success) {
        console.log('Fetched employees:', data.data.length, 'total');
        console.log('Active:', data.data.filter((e: Employee) => e.is_active).length);
        console.log('Inactive:', data.data.filter((e: Employee) => !e.is_active).length);
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (!formData.password || formData.password.length < 6) {
      alert('Password minimal 6 karakter!');
      return;
    }

    try {
      // Validate username
      if (!formData.username || formData.username.trim() === '') {
        alert('Username tidak boleh kosong!');
        return;
      }

      // Create user account first
      const userResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone || undefined,
          role: 'user'
        }),
      });

      const userData = await userResponse.json();
      
      if (!userData.success) {
        // Show detailed error if available
        const errorMsg = userData.details || userData.error || 'Gagal membuat akun user';
        alert(errorMsg);
        return;
      }

      console.log('User created:', userData.user.email);

      // Create employee record (without password)
      const { password, ...employeeData } = formData;
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.user.id,
          ...employeeData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Karyawan berhasil ditambahkan!\n\nUsername: ${formData.username}\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nSilakan berikan informasi login ini kepada karyawan.`);
        setShowAddModal(false);
        setFormData({
          employee_code: '',
          full_name: '',
          username: '',
          email: '',
          password: '',
          phone: '',
          department: '',
          position: '',
        });
        fetchEmployees();
      } else {
        alert(data.error || 'Gagal menambah karyawan');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Gagal menambah karyawan');
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_code: employee.employee_code,
      full_name: employee.full_name,
      username: employee.username || '',
      email: employee.email,
      password: '', // Not used in edit mode
      phone: employee.phone || '',
      department: employee.department || '',
      position: employee.position || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEmployee) return;

    try {
      // Remove password from update data
      const { password, ...updateData } = formData;
      
      const response = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (data.success) {
        alert('Karyawan berhasil diupdate!');
        setShowEditModal(false);
        setEditingEmployee(null);
        setFormData({
          employee_code: '',
          full_name: '',
          username: '',
          email: '',
          password: '',
          phone: '',
          department: '',
          position: '',
        });
        fetchEmployees();
      } else {
        alert(data.error || 'Gagal update karyawan');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Gagal update karyawan');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
      const employee = employees.find(emp => emp.id === id);
      if (!employee) return;

    const action = currentStatus ? 'deactivate' : 'activate';
    const actionText = currentStatus ? 'menonaktifkan' : 'mengaktifkan';
    const statusText = currentStatus ? 'NON-AKTIF' : 'AKTIF';

    if (!confirm(`${currentStatus ? '⚠️' : '✅'} ${actionText.toUpperCase()} KARYAWAN\n\nApakah Anda yakin ingin ${actionText} karyawan ini?\n\nNama: ${employee.full_name}\nEmail: ${employee.email}\nStatus Saat Ini: ${currentStatus ? 'AKTIF' : 'NON-AKTIF'}\nStatus Baru: ${statusText}\n\nLanjutkan?`)) return;

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Karyawan berhasil di${actionText}!`);
        fetchEmployees();
      } else {
        alert(data.error || `Gagal ${actionText} karyawan`);
      }
    } catch (error: any) {
      console.error(`Error toggling employee status:`, error);
      alert(error.message || `Gagal ${actionText} karyawan`);
    }
  };

  const handleTrainFace = (employee: Employee) => {
    setTrainingEmployee(employee);
    setShowTrainingModal(true);
  };

  const handleTrainingComplete = async (faceEncoding: string, matchScore: number) => {
    if (!trainingEmployee) return;

    try {
      console.log('💾 Saving training with score:', matchScore);
      const response = await fetch(`/api/employees/${trainingEmployee.id}/face-encoding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceEncoding, matchScore }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Pelatihan wajah berhasil disimpan!\n\nSkor Training: ${matchScore}%\n\nSkor ini akan digunakan sebagai baseline untuk verifikasi wajah.`);
        setShowTrainingModal(false);
        setTrainingEmployee(null);
        fetchEmployees();
      } else {
        alert(data.error || 'Gagal menyimpan pelatihan wajah');
      }
    } catch (error) {
      console.error('Error saving face training:', error);
      alert('Gagal menyimpan pelatihan wajah');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) {
      alert('Karyawan tidak ditemukan');
      return;
    }

    if (!confirm(`🔴 HAPUS PERMANEN - TIDAK BISA DIBATALKAN!\n\nApakah Anda yakin ingin menghapus PERMANEN karyawan ini?\n\nNama: ${employee.full_name}\nEmail: ${employee.email}\n\n⚠️ DATA AKAN DIHAPUS DARI DATABASE!\n⚠️ Semua riwayat absensi akan TERHAPUS!\n⚠️ User account akan TERHAPUS!\n⚠️ TIDAK BISA dikembalikan!\n✅ Email DAPAT digunakan lagi untuk karyawan baru\n\nKetik konfirmasi untuk melanjutkan.`)) return;

    // Double confirmation
    const confirmText = prompt('Ketik "HAPUS" untuk konfirmasi penghapusan permanen:');
    if (confirmText !== 'HAPUS') {
      alert('Penghapusan dibatalkan.');
      return;
    }

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus karyawan');
      }

      if (data.success) {
        setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== id));
        alert('✅ Karyawan berhasil dihapus PERMANEN dari database!\n\nData karyawan, user account, dan riwayat absensi telah dihapus.\nEmail dapat digunakan kembali untuk karyawan baru.');
        fetchEmployees();
      } else {
        alert(data.error || 'Gagal menghapus karyawan');
      }
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      alert(error.message || 'Gagal menghapus karyawan. Silakan coba lagi.');
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-white hover:text-white/80 text-sm sm:text-base"
              >
                ← Kembali
              </button>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Kelola Karyawan</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-sm sm:text-base w-full sm:w-auto"
            >
              + Tambah Karyawan
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Summary */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
            <div className="text-white/60 text-sm">Total Karyawan</div>
            <div className="text-2xl font-bold text-white">{employees.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
            <div className="text-white/60 text-sm">Aktif</div>
            <div className="text-2xl font-bold text-green-400">{employees.filter(e => e.is_active).length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
            <div className="text-white/60 text-sm">Non-Aktif</div>
            <div className="text-2xl font-bold text-red-400">{employees.filter(e => !e.is_active).length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
            <div className="text-white/60 text-sm">Persentase Aktif</div>
            <div className="text-2xl font-bold text-blue-400">
              {employees.length > 0 ? Math.round((employees.filter(e => e.is_active).length / employees.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {employees.map((employee) => (
            <div key={employee.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{employee.full_name}</h3>
                  <p className="text-white/60 text-sm">{employee.employee_code}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  employee.is_active
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {employee.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-white/80 text-sm">
                  <span className="text-white/60">Email:</span> {employee.email}
                </p>
                <p className="text-white/80 text-sm">
                  <span className="text-white/60">Departemen:</span> {employee.department || '-'}
                </p>
                <p className="text-white/80 text-sm">
                  <span className="text-white/60">Jabatan:</span> {employee.position || '-'}
                </p>
                <p className="text-white/80 text-sm">
                  <span className="text-white/60">Training Score:</span>{' '}
                  {employee.face_match_score ? (
                    <span className="font-semibold text-green-400">{employee.face_match_score}%</span>
                  ) : (
                    <span className="text-yellow-400">Belum dilatih</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="flex-1 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-sm font-medium"
                        title="Edit Karyawan"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleTrainFace(employee)}
                        className="flex-1 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all text-sm font-medium"
                        title="Latih Wajah"
                      >
                        {employee.face_encoding_path ? 'Update Wajah' : 'Latih Wajah'}
                      </button>
                <button
                  onClick={() => handleToggleStatus(employee.id, employee.is_active)}
                  className={`flex-1 p-2 rounded-lg transition-all text-sm font-medium ${
                    employee.is_active
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  title={employee.is_active ? 'Nonaktifkan Karyawan' : 'Aktifkan Karyawan'}
                >
                  {employee.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                  title="Hapus Permanen (Hard Delete)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Kode</th>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Nama</th>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Email</th>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Departemen</th>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Jabatan</th>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Training Score</th>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Status</th>
                  <th className="text-left px-4 xl:px-6 py-4 text-white font-semibold text-sm xl:text-base">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 xl:px-6 py-4 text-white/80 text-sm xl:text-base">{employee.employee_code}</td>
                    <td className="px-4 xl:px-6 py-4 text-white text-sm xl:text-base">{employee.full_name}</td>
                    <td className="px-4 xl:px-6 py-4 text-white/80 text-sm xl:text-base">{employee.email}</td>
                    <td className="px-4 xl:px-6 py-4 text-white/80 text-sm xl:text-base">{employee.department || '-'}</td>
                    <td className="px-4 xl:px-6 py-4 text-white/80 text-sm xl:text-base">{employee.position || '-'}</td>
                    <td className="px-4 xl:px-6 py-4 text-sm xl:text-base">
                      {employee.face_match_score ? (
                        <span className="font-semibold text-green-400">{employee.face_match_score}%</span>
                      ) : (
                        <span className="text-yellow-400">Belum dilatih</span>
                      )}
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <span className={`px-2 xl:px-3 py-1 rounded-full text-xs xl:text-sm ${
                        employee.is_active
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {employee.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="flex items-center gap-1 xl:gap-2">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="p-1.5 xl:p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-105"
                          title="Edit Karyawan"
                        >
                          <svg className="w-3 xl:w-4 h-3 xl:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleTrainFace(employee)}
                          className="p-1.5 xl:p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all hover:scale-105"
                          title={employee.face_encoding_path ? 'Update Wajah' : 'Latih Wajah'}
                        >
                          <svg className="w-3 xl:w-4 h-3 xl:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(employee.id, employee.is_active)}
                          className={`p-1.5 xl:p-2 rounded-lg transition-all hover:scale-105 ${
                            employee.is_active
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                          title={employee.is_active ? 'Nonaktifkan Karyawan' : 'Aktifkan Karyawan'}
                        >
                          {employee.is_active ? (
                            <svg className="w-3 xl:w-4 h-3 xl:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-3 xl:w-4 h-3 xl:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="p-1.5 xl:p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-105"
                          title="Hapus Permanen (Hard Delete)"
                        >
                          <svg className="w-3 xl:w-4 h-3 xl:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Tambah Karyawan</h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Kode Karyawan</label>
                <input
                  type="text"
                  value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Username <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Username untuk login"
                  required
                />
                <p className="text-white/60 text-xs mt-1">Username unik untuk login</p>
              </div>
              <div>
                <label className="block text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
                <p className="text-white/60 text-xs mt-1">Password akan digunakan karyawan untuk login</p>
              </div>
              <div>
                <label className="block text-white/80 mb-2">Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Departemen</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Jabatan</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Tambah
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      employee_code: '',
                      full_name: '',
                      username: '',
                      email: '',
                      password: '',
                      phone: '',
                      department: '',
                      position: '',
                    });
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Karyawan</h2>
            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Kode Karyawan</label>
                <input
                  type="text"
                  value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Departemen</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Jabatan</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEmployee(null);
                    setFormData({
                      employee_code: '',
                      full_name: '',
                      username: '',
                      email: '',
                      password: '',
                      phone: '',
                      department: '',
                      position: '',
                    });
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Face Training Modal */}
      {showTrainingModal && trainingEmployee && (
        <FaceTrainingCamera
          onComplete={handleTrainingComplete}
          onClose={() => {
            setShowTrainingModal(false);
            setTrainingEmployee(null);
          }}
        />
      )}
    </div>
  );
}

