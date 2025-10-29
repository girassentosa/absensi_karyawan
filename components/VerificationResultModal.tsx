'use client';

import { useEffect, useState } from 'react';

interface VerificationResultModalProps {
  isOpen: boolean;
  success: boolean;
  verificationScore: number;
  trainingScore?: number;
  threshold?: number;
  onClose: () => void;
  onContinue?: () => void;
  onRetry?: () => void; // ← Tambah callback untuk retry
  actionText?: string; // Custom button text
}

export default function VerificationResultModal({
  isOpen,
  success,
  verificationScore,
  trainingScore,
  threshold,
  onClose,
  onContinue,
  onRetry, // ← Terima prop onRetry
  actionText = 'Lanjutkan Check-in'
}: VerificationResultModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay untuk smooth animation
      setTimeout(() => setShow(true), 100);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
      onContinue?.();
    }, 300);
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 transition-all duration-300 ${
        show ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-xs sm:max-w-md md:max-w-lg w-full overflow-hidden transition-all duration-500 transform ${
          show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className={`relative px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-7 md:pb-8 ${
          success 
            ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600' 
            : 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-600'
        }`}>
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute -top-8 sm:-top-10 -right-8 sm:-right-10 w-32 sm:w-40 h-32 sm:h-40 rounded-full blur-3xl opacity-30 ${
              success ? 'bg-white' : 'bg-white'
            }`}></div>
            <div className={`absolute -bottom-8 sm:-bottom-10 -left-8 sm:-left-10 w-32 sm:w-40 h-32 sm:h-40 rounded-full blur-3xl opacity-30 ${
              success ? 'bg-white' : 'bg-white'
            }`}></div>
          </div>

          {/* Icon */}
          <div className="relative flex justify-center mb-3 sm:mb-4">
            <div className={`relative ${
              success ? 'animate-bounce-slow' : 'animate-shake'
            }`}>
              {success ? (
                <div className="bg-white rounded-full p-3 sm:p-4 shadow-xl">
                  <svg className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <div className="bg-white rounded-full p-3 sm:p-4 shadow-xl">
                  <svg className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-1 sm:mb-2">
            {success ? 'Verifikasi Berhasil!' : 'Verifikasi Gagal'}
          </h2>
          <p className="text-white/90 text-center text-xs sm:text-sm">
            {success 
              ? 'Wajah Anda berhasil diverifikasi' 
              : 'Wajah tidak dapat diverifikasi'
            }
          </p>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Scores Display */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {/* Verification Score */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Skor Verifikasi</span>
                </div>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
                  success ? 'text-blue-600' : 'text-red-500'
                }`}>
                  {verificationScore}%
                </span>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        success 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                          : 'bg-gradient-to-r from-red-500 to-pink-600'
                      }`}
                      style={{ width: `${Math.min(verificationScore, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Score */}
            {trainingScore !== undefined && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-green-100">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Skor Training</span>
                  </div>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">
                    {trainingScore}%
                  </span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000"
                        style={{ width: `${Math.min(trainingScore, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Threshold */}
            {threshold !== undefined && (
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-purple-100">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Threshold Sistem</span>
                  </div>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-1 sm:gap-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600">
                    {threshold}%
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">minimum required</span>
                </div>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center ${
            success 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">
                {success ? '✅' : '❌'}
              </span>
              <span className="text-base sm:text-lg md:text-xl font-bold text-white">
                Status: {success ? 'LULUS' : 'GAGAL'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
            {success ? (
              <button
                onClick={handleContinue}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl active:scale-95 sm:hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                {actionText}
              </button>
            ) : (
              <>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl active:scale-95 sm:hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    handleClose();
                    // Panggil onRetry jika ada, kalau tidak fallback ke reload
                    if (onRetry) {
                      onRetry();
                    } else {
                      window.location.reload();
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl active:scale-95 sm:hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                >
                  Coba Lagi
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

