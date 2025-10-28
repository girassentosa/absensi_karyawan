'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState({
    faceThreshold: 80,
    gpsRadius: 3000,
  });

  useEffect(() => {
    checkAuth();
    fetchSystemSettings();
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

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/system-settings');
      const data = await response.json();
      
      if (data.success) {
        const settings = data.data;
        setSystemSettings({
          faceThreshold: parseInt(settings.face_recognition_threshold?.value || '80'),
          gpsRadius: parseInt(settings.gps_accuracy_radius?.value || '3000'),
        });
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
      setSystemSettings({
        faceThreshold: 80,
        gpsRadius: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const faceThreshold = systemSettings.faceThreshold || 80;
      const gpsRadius = systemSettings.gpsRadius || 3000;
      
      if (faceThreshold < 50 || faceThreshold > 100) {
        alert('Face Recognition Threshold harus antara 50-100%');
        return;
      }
      
      if (gpsRadius < 10 || gpsRadius > 10000) {
        alert('GPS Radius harus antara 10-10000 meter');
        return;
      }
      
      const response = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          face_recognition_threshold: faceThreshold,
          gps_accuracy_radius: gpsRadius,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
      const validSettings = {
        faceThreshold: faceThreshold,
        gpsRadius: gpsRadius,
      };
      setSystemSettings(validSettings);
        alert(
          '✅ Pengaturan berhasil disimpan ke database!\n\n' +
          'Face Recognition Threshold: ' + faceThreshold + '%\n' +
          'GPS Accuracy Radius: ' + gpsRadius + ' meter\n\n' +
          'Pengaturan ini akan berlaku untuk semua karyawan.'
        );
      } else {
        alert(data.error || 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan');
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Pengaturan Sistem</h1>
              <p className="text-white/60 text-sm mt-1">Konfigurasi Face Recognition & GPS Validation</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-white/80">
              <p className="font-semibold text-white mb-1">Informasi:</p>
              <ul className="space-y-1 text-white/70">
                <li>• Pengaturan ini berlaku untuk <strong>semua karyawan</strong></li>
                <li>• Untuk mengatur <strong>lokasi kantor</strong>, gunakan menu <strong>"Lokasi Kantor"</strong> di dashboard</li>
                <li>• Perubahan langsung tersimpan ke database</li>
              </ul>
                    </div>
                  </div>
                </div>

        {/* System Settings */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Pengaturan Validasi</h2>
          
          <div className="space-y-6">
            {/* Face Recognition Threshold */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Face Recognition Threshold</h3>
                  <p className="text-white/60 text-sm">Minimal similarity score untuk verifikasi wajah berhasil</p>
          </div>
        </div>

              <div className="flex items-center gap-4">
              <input
                type="number"
                  min="50"
                max="100"
                value={systemSettings.faceThreshold}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                      setSystemSettings({ ...systemSettings, faceThreshold: 50 });
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                        setSystemSettings({ ...systemSettings, faceThreshold: numValue });
                      }
                    }
                  }}
                  className="w-32 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="80"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">50%</span>
                    <span className="text-white font-semibold">{systemSettings.faceThreshold}%</span>
                    <span className="text-white/60 text-sm">100%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${systemSettings.faceThreshold}%` }}
                    ></div>
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    Rekomendasi: 70-85% (lebih tinggi = lebih ketat)
                  </p>
                </div>
              </div>
            </div>

            {/* GPS Accuracy Radius */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
            </div>
              <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">GPS Accuracy Radius</h3>
                  <p className="text-white/60 text-sm">Jarak maksimal dari lokasi kantor untuk check-in valid</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
              <input
                type="number"
                  min="10"
                max="10000"
                value={systemSettings.gpsRadius}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                      setSystemSettings({ ...systemSettings, gpsRadius: 10 });
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                        setSystemSettings({ ...systemSettings, gpsRadius: numValue });
                      }
                    }
                  }}
                  className="w-32 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="3000"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">10m</span>
                    <span className="text-white font-semibold">{systemSettings.gpsRadius} meter</span>
                    <span className="text-white/60 text-sm">10km</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((systemSettings.gpsRadius / 10000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    Rekomendasi: 100-5000m (tergantung area kantor)
                  </p>
                </div>
              </div>
            </div>
            </div>

          {/* Summary & Save */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-white/60 text-sm">
                <p className="font-semibold text-white mb-2">Ringkasan Pengaturan:</p>
                <ul className="space-y-1">
                  <li>• Face Threshold: <span className="text-purple-400 font-bold">{systemSettings.faceThreshold}%</span></li>
                  <li>• GPS Radius: <span className="text-green-400 font-bold">{systemSettings.gpsRadius} meter</span></li>
                </ul>
              </div>
              <button 
                onClick={handleSaveSettings}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
