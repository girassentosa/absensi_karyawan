'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar, { SidebarToggleButton } from '@/components/AdminSidebar';

interface OfficeLocation {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius: number;
  is_active: boolean;
  created_at: string;
}

export default function OfficeLocationsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [locations, setLocations] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<OfficeLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: '100',
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/admin');
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/admin');
      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== 'admin') {
      router.push('/user/dashboard');
      return;
    }

    fetchLocations();
  }, [router]);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/office-locations');
      const data = await response.json();
      
      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      alert('Gagal mengambil data lokasi kantor');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      radius: '100',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (location: OfficeLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius: location.radius.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.latitude || !formData.longitude) {
      alert('Nama, Latitude, dan Longitude harus diisi!');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Latitude dan Longitude harus berupa angka!');
      return;
    }

    if (lat < -90 || lat > 90) {
      alert('Latitude harus antara -90 dan 90!');
      return;
    }

    if (lng < -180 || lng > 180) {
      alert('Longitude harus antara -180 dan 180!');
      return;
    }

    try {
      const url = editingLocation
        ? `/api/office-locations/${editingLocation.id}`
        : '/api/office-locations';
      
      const method = editingLocation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          latitude: lat,
          longitude: lng,
          radius: parseInt(formData.radius),
          is_active: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingLocation ? 'Lokasi berhasil diupdate!' : 'Lokasi berhasil ditambahkan!');
        setShowModal(false);
        fetchLocations();
      } else {
        alert(data.error || 'Gagal menyimpan lokasi');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Gagal menyimpan lokasi');
    }
  };

  const handleToggleActive = async (location: OfficeLocation) => {
    try {
      const response = await fetch(`/api/office-locations/${location.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...location,
          is_active: !location.is_active,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchLocations();
      } else {
        alert(data.error || 'Gagal mengubah status lokasi');
      }
    } catch (error) {
      console.error('Error toggling location:', error);
      alert('Gagal mengubah status lokasi');
    }
  };

  const handleDelete = async (location: OfficeLocation) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus lokasi "${location.name}"?\n\nData yang dihapus tidak dapat dikembalikan!`)) {
      return;
    }

    try {
      const response = await fetch(`/api/office-locations/${location.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Lokasi berhasil dihapus!');
        fetchLocations();
      } else {
        alert(data.error || 'Gagal menghapus lokasi');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Gagal menghapus lokasi');
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          });
          alert('✅ Koordinat berhasil diambil dari lokasi Anda saat ini!');
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Gagal mengambil lokasi. Pastikan izin lokasi sudah diberikan.');
        }
      );
    } else {
      alert('Browser Anda tidak mendukung geolocation');
    }
  };

  const activeLocations = locations.filter(loc => loc.is_active);
  const inactiveLocations = locations.filter(loc => !loc.is_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat data lokasi...</p>
        </div>
      </div>
    );
  }

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span>Lokasi Kantor</span>
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddModal}
                className="px-3 sm:px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-600 hover:text-green-700 text-sm font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Tambah</span>
              </button>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Lokasi</p>
                <p className="text-2xl font-bold text-slate-900">{locations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-green-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Lokasi Aktif</p>
                <p className="text-2xl font-bold text-green-600">{activeLocations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-orange-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Nonaktif</p>
                <p className="text-2xl font-bold text-orange-600">{inactiveLocations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Locations List */}
        {locations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Lokasi</h3>
            <p className="text-slate-500 mb-4">Klik tombol "Tambah Lokasi" untuk menambahkan lokasi kantor baru</p>
            <button
              onClick={handleOpenAddModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Tambah Lokasi Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Location Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">{location.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border ${
                        location.is_active 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        <span>{location.is_active ? '●' : '○'}</span>
                        <span>{location.is_active ? 'Aktif' : 'Nonaktif'}</span>
                      </span>
                    </div>
                    {location.address && (
                      <p className="text-slate-500 text-sm mb-3">{location.address}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-blue-600 font-medium mb-1">Latitude</p>
                        <p className="text-sm text-slate-900 font-semibold">{location.latitude}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-purple-600 font-medium mb-1">Longitude</p>
                        <p className="text-sm text-slate-900 font-semibold">{location.longitude}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <p className="text-xs text-orange-600 font-medium mb-1">Radius</p>
                        <p className="text-sm text-slate-900 font-semibold">{location.radius}m</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:justify-center">
                    <button
                      onClick={() => handleToggleActive(location)}
                      className={`flex-1 lg:flex-none px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border ${
                        location.is_active
                          ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200'
                          : 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200'
                      }`}
                    >
                      {location.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(location)}
                      className="flex-1 lg:flex-none bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(location)}
                      className="flex-1 lg:flex-none bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{editingLocation ? 'Edit Lokasi' : 'Tambah Lokasi'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-2 text-sm">
                  Nama Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Contoh: Kantor Pusat"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2 text-sm">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Contoh: Jl. Sudirman No. 123, Jakarta"
                  rows={2}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-slate-700 font-semibold mb-2 text-sm">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="-6.200000"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-slate-700 font-semibold mb-2 text-sm">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="106.816666"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="w-full bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Gunakan Lokasi Saya Saat Ini
              </button>

              <div>
                <label className="block text-slate-700 font-semibold mb-2 text-sm">
                  Radius (meter)
                </label>
                <input
                  type="number"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="100"
                  min="50"
                  max="10000"
                />
                <p className="text-slate-500 text-xs mt-1">
                  Radius default diatur di Settings Admin (GPS Accuracy Radius)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {editingLocation ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
      </div>
    </div>
  );
}
