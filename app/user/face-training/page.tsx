'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserSidebar, { SidebarToggleButton } from '@/components/UserSidebar';
import dynamic from 'next/dynamic';

const FaceTrainingCamera = dynamic(() => import('@/components/FaceTrainingCamera'), {
  ssr: false,
});

export default function FaceTrainingPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTrainingModal, setShowTrainingModal] = useState(false);

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
      const response = await fetch(`/api/employees?email=${email}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setEmployee(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainingComplete = async (faceEncoding: string, matchScore: number) => {
    if (!employee) return;

    console.log('✅ Training complete, closing modal...');
    const employeeToSave = employee;
    setShowTrainingModal(false);

    try {
      console.log('💾 Saving training with score:', matchScore);
      const response = await fetch(`/api/employees/${employeeToSave.id}/face-encoding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceEncoding, matchScore }),
      });

      const data = await response.json();
      if (data.success) {
        setTimeout(() => {
          alert(`✅ Training wajah berhasil!\n\nScore: ${matchScore.toFixed(2)}%\n\nData wajah Anda sudah tersimpan di sistem.`);
        }, 200);
        
        // Refresh employee data
        if (user?.email) {
          await fetchEmployeeData(user.email);
        }
      } else {
        alert(data.error || 'Gagal menyimpan training wajah');
      }
    } catch (error) {
      console.error('Error saving face training:', error);
      alert('Gagal menyimpan training wajah');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UserSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarToggleButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Latih Wajah</h1>
                    <p className="text-xs sm:text-sm text-slate-500">Training Face Recognition</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Tentang Face Training</h3>
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                    Training wajah diperlukan untuk sistem absensi menggunakan face recognition. 
                    Proses ini akan merekam data wajah Anda dari 6 posisi berbeda untuk meningkatkan akurasi pengenalan.
                  </p>
                </div>
              </div>
            </div>

            {/* Employee Info Card */}
            {employee && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informasi Karyawan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Nama Lengkap</p>
                    <p className="text-sm font-semibold text-slate-900">{employee.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Kode Karyawan</p>
                    <p className="text-sm font-semibold text-slate-900">{employee.employee_code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Department</p>
                    <p className="text-sm font-semibold text-slate-900">{employee.department || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status Training</p>
                    <p className={`text-sm font-semibold ${employee.face_descriptor ? 'text-green-600' : 'text-amber-600'}`}>
                      {employee.face_descriptor ? '✅ Sudah Terlatih' : '⚠️ Belum Terlatih'}
                    </p>
                  </div>
                </div>

                {employee.face_match_score && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-xs text-green-700 mb-1">Score Training Terakhir</p>
                    <p className="text-2xl font-bold text-green-600">{employee.face_match_score.toFixed(2)}%</p>
                  </div>
                )}
              </div>
            )}

            {/* Training Instructions */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Instruksi Training
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <p className="text-sm text-slate-700">Pastikan pencahayaan ruangan cukup terang</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <p className="text-sm text-slate-700">Posisikan wajah di tengah frame kamera</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <p className="text-sm text-slate-700">Ikuti instruksi untuk setiap posisi wajah (6 step)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <p className="text-sm text-slate-700">Tunggu hingga confidence mencapai minimal 85%</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
                  <p className="text-sm text-slate-700">Proses akan otomatis lanjut ke step berikutnya</p>
                </div>
              </div>
            </div>

            {/* Training Button */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-200">
              <button
                onClick={() => setShowTrainingModal(true)}
                disabled={!employee}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {employee?.face_descriptor ? 'Update Training Wajah' : 'Mulai Training Wajah'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Training Modal */}
      {showTrainingModal && employee && (
        <FaceTrainingCamera
          onComplete={handleTrainingComplete}
          onClose={() => setShowTrainingModal(false)}
        />
      )}
    </div>
  );
}

