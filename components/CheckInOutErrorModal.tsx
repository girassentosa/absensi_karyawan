'use client';

import { useEffect, useState } from 'react';

interface CheckInOutErrorModalProps {
  isOpen: boolean;
  isCheckOut: boolean;
  errorType: 'gps_out_of_range' | 'gps_not_available' | 'employee_not_found' | 'api_error' | 'network_error';
  message: string;
  // GPS error specific data
  userLocation?: {
    lat: number;
    lng: number;
  };
  distance?: string; // Jarak ke kantor aktif
  maxRadius?: number;
  // Time
  time?: {
    timeStr: string;
    dateStr: string;
  };
  onClose: () => void;
  onRetry?: () => void;
}

export default function CheckInOutErrorModal({
  isOpen,
  isCheckOut,
  errorType,
  message,
  userLocation,
  distance,
  maxRadius,
  time,
  onClose,
  onRetry
}: CheckInOutErrorModalProps) {
  const [show, setShow] = useState(false);
  const [showXMark, setShowXMark] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay untuk smooth animation
      setTimeout(() => setShow(true), 100);
      // Trigger icon animation after modal appears
      setTimeout(() => setShowXMark(true), 400);
    } else {
      setShow(false);
      setShowXMark(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleRetry = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
      onRetry?.();
    }, 300);
  };

  // Format koordinat untuk display
  const formatCoordinate = (coord: number) => {
    return coord.toFixed(4) + '°';
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 transition-all duration-300 ${
        show ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-white rounded-3xl shadow-2xl max-w-xs sm:max-w-md w-full overflow-hidden transition-all duration-500 transform ${
          show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated X Icon */}
        <div className="relative pt-6 pb-4 px-6">
          <div className="flex justify-center mb-4">
            <div className={`relative transition-all duration-700 transform ${
              showXMark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-180 opacity-0'
            }`}>
              {/* Animated Circle with X */}
              <div className="relative">
                {/* Outer Ring Animation */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 via-rose-500 to-pink-500 animate-ping opacity-75"></div>
                
                {/* Main Circle */}
                <div className="relative bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 rounded-full p-3 sm:p-3.5 shadow-xl">
                  {/* Animated X SVG */}
                  <svg 
                    className="w-10 h-10 sm:w-12 sm:h-12 text-white" 
                    viewBox="0 0 52 52"
                  >
                    <circle 
                      className="x-circle"
                      cx="26" cy="26" r="25" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="3"
                      style={{
                        strokeDasharray: '166',
                        strokeDashoffset: showXMark ? '0' : '166',
                        transition: 'stroke-dashoffset 0.6s ease-in-out 0.3s'
                      }}
                    />
                    {/* X mark - two diagonal lines */}
                    <path 
                      className="x-line-1"
                      fill="none" 
                      stroke="white" 
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      d="M16 16l20 20"
                      style={{
                        strokeDasharray: '28',
                        strokeDashoffset: showXMark ? '0' : '28',
                        transition: 'stroke-dashoffset 0.4s ease-in-out 0.6s'
                      }}
                    />
                    <path 
                      className="x-line-2"
                      fill="none" 
                      stroke="white" 
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      d="M36 16l-20 20"
                      style={{
                        strokeDasharray: '28',
                        strokeDashoffset: showXMark ? '0' : '28',
                        transition: 'stroke-dashoffset 0.4s ease-in-out 0.8s'
                      }}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Error Title */}
          <div className="text-center mb-1">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-1">
              {isCheckOut ? 'Check-out Gagal!' : 'Check-in Gagal!'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              {message}
            </p>
          </div>
        </div>

        {/* Info Cards - Compact Design */}
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-br from-slate-50 to-red-50 rounded-2xl p-4 border-2 border-red-100 shadow-inner space-y-3">
            {/* GPS Out of Range - Detail Info */}
            {errorType === 'gps_out_of_range' && userLocation && distance && maxRadius && (
              <>
                {/* Lokasi User Card */}
                <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-600">Lokasi Anda</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {formatCoordinate(userLocation.lat)}, {formatCoordinate(userLocation.lng)}
                  </p>
                </div>

                {/* Jarak dari Lokasi Kantor Card */}
                <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-600">Jarak dari Lokasi Kantor</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {distance}m
                  </p>
                </div>

                {/* Radius Maksimal Card */}
                <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-600">Radius Maksimal</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {maxRadius}m
                  </p>
                </div>
              </>
            )}

            {/* GPS Not Available */}
            {errorType === 'gps_not_available' && (
              <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-600">Lokasi</span>
                </div>
                <p className="text-sm font-bold text-slate-800 mb-0.5">
                  GPS tidak tersedia
                </p>
                <p className="text-xs text-slate-600">
                  Pastikan GPS aktif dan izin lokasi diberikan
                </p>
              </div>
            )}

            {/* Employee Not Found */}
            {errorType === 'employee_not_found' && (
              <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-600">Error</span>
                </div>
                <p className="text-sm font-bold text-slate-800 mb-0.5">
                  Data karyawan tidak ditemukan
                </p>
                <p className="text-xs text-slate-600">
                  Silakan hubungi admin
                </p>
              </div>
            )}

            {/* API Error or Network Error */}
            {(errorType === 'api_error' || errorType === 'network_error') && (
              <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-600">Error Detail</span>
                </div>
                <p className="text-sm font-bold text-slate-800 mb-0.5">
                  {errorType === 'network_error' ? 'Koneksi terputus' : 'Terjadi kesalahan sistem'}
                </p>
                <p className="text-xs text-slate-600">
                  {errorType === 'network_error' ? 'Periksa koneksi internet Anda' : 'Silakan coba lagi'}
                </p>
              </div>
            )}

            {/* Waktu Card - Always show if available */}
            {time && (
              <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-600">Waktu</span>
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {time.timeStr}
                </p>
                <p className="text-xs text-slate-600">
                  {time.dateStr}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-4">
          <div className={`grid ${onRetry ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            {/* Tutup Button */}
            <button
              onClick={handleClose}
              className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white font-bold rounded-xl p-3 shadow-sm hover:shadow-md active:scale-98 transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Tutup</span>
            </button>

            {/* Coba Lagi Button - Only show if onRetry is provided */}
            {onRetry && (
              <button
                onClick={handleRetry}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl p-3 shadow-sm hover:shadow-md active:scale-98 transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Coba Lagi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

