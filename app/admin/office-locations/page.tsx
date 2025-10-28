'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    // Check if user is admin
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/admin');
      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== 'admin') {
      router.push('/');
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

    // Validation
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Kelola Lokasi Kantor</h1>
            <p className="text-white/60 text-sm mt-1">Atur lokasi kantor untuk validasi GPS check-in karyawan</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Lokasi</p>
                <p className="text-3xl font-bold text-white mt-1">{locations.length}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Lokasi Aktif</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{activeLocations.length}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Lokasi Nonaktif</p>
                <p className="text-3xl font-bold text-orange-400 mt-1">{inactiveLocations.length}</p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Lokasi Kantor
        </button>
      </div>

      {/* Locations List */}
      <div className="max-w-7xl mx-auto">
        {locations.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-white/60 text-lg">Belum ada lokasi kantor</p>
            <p className="text-white/40 text-sm mt-2">Klik tombol "Tambah Lokasi Kantor" untuk menambahkan lokasi baru</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border ${
                  location.is_active ? 'border-green-500/50' : 'border-white/20'
                } hover:bg-white/15 transition-all duration-200`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{location.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        location.is_active 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                      }`}>
                        {location.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    {location.address && (
                      <p className="text-white/60 text-sm mb-3">{location.address}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-white/80">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                        <span>Lat: {location.latitude}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                        <span>Lng: {location.longitude}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span>Radius: {location.radius}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col gap-2">
                    <button
                      onClick={() => handleToggleActive(location)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        location.is_active
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                      }`}
                    >
                      {location.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(location)}
                      className="flex-1 sm:flex-none bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(location)}
                      className="flex-1 sm:flex-none bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingLocation ? 'Edit Lokasi Kantor' : 'Tambah Lokasi Kantor'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 text-sm font-semibold">
                  Nama Lokasi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Contoh: Kantor Pusat"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm font-semibold">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Contoh: Jl. Sudirman No. 123, Jakarta"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-white/80 mb-2 text-sm font-semibold">
                    Latitude <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="-6.200000"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-white/80 mb-2 text-sm font-semibold">
                    Longitude <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="106.816666"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="w-full bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30 px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Gunakan Lokasi Saya Saat Ini
              </button>

              <div>
                <label className="block text-white/80 mb-2 text-sm font-semibold">
                  Radius (meter)
                </label>
                <input
                  type="number"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="100"
                  min="50"
                  max="10000"
                />
                <p className="text-white/40 text-xs mt-1">
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
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 transition-all"
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

