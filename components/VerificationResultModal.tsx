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
  onRetry?: () => void;
  actionText?: string;
  // Employee data for success modal
  employeeData?: {
    full_name: string;
    employee_code: string;
    position: string;
    avatar_url?: string;
  };
}

export default function VerificationResultModal({
  isOpen,
  success,
  verificationScore,
  trainingScore,
  threshold,
  onClose,
  onContinue,
  onRetry,
  actionText = 'Lanjutkan Check-in',
  employeeData
}: VerificationResultModalProps) {
  const [show, setShow] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay untuk smooth animation
      setTimeout(() => setShow(true), 100);
      // Trigger icon animation after modal appears (for both success and failed)
      setTimeout(() => setShowCheckmark(true), 400);
    } else {
      setShow(false);
      setShowCheckmark(false);
    }
  }, [isOpen, success]);

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

  // Success Modal - New Design with Profile Card
  if (success && employeeData) {
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
          {/* Animated Checkmark Icon */}
          <div className="relative pt-6 pb-4 px-6">
            <div className="flex justify-center mb-4">
              <div className={`relative transition-all duration-700 transform ${
                showCheckmark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-180 opacity-0'
              }`}>
                {/* Animated Circle with Checkmark */}
                <div className="relative">
                  {/* Outer Ring Animation */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 animate-ping opacity-75"></div>
                  
                  {/* Main Circle - Ukuran lebih kecil */}
                  <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-full p-3 sm:p-3.5 shadow-xl">
                    {/* Animated Checkmark SVG - Ukuran lebih kecil */}
                    <svg 
                      className="w-10 h-10 sm:w-12 sm:h-12 text-white" 
                      viewBox="0 0 52 52"
                    >
                      <circle 
                        className="checkmark-circle"
                        cx="26" cy="26" r="25" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="3"
                        style={{
                          strokeDasharray: '166',
                          strokeDashoffset: showCheckmark ? '0' : '166',
                          transition: 'stroke-dashoffset 0.6s ease-in-out 0.3s'
                        }}
                      />
                      <path 
                        className="checkmark-check"
                        fill="none" 
                        stroke="white" 
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.1 27.2l7.1 7.2 16.7-16.8"
                        style={{
                          strokeDasharray: '48',
                          strokeDashoffset: showCheckmark ? '0' : '48',
                          transition: 'stroke-dashoffset 0.4s ease-in-out 0.6s'
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Title */}
            <div className="text-center mb-1">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                Verifikasi Berhasil!
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Wajah anda dikenali sebagai
              </p>
            </div>
          </div>

          {/* Employee Profile Card */}
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-4 border-2 border-blue-100 shadow-inner">
              {/* Profile Photo */}
              <div className="flex justify-center mb-3">
                <div className="relative">
                  {/* Animated Ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"></div>
                  
                  {/* Photo Container - Ukuran lebih kecil */}
                  <div className="relative bg-white rounded-full p-1">
                    {employeeData.avatar_url ? (
                      <img 
                        src={employeeData.avatar_url} 
                        alt={employeeData.full_name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-3 border-white shadow-lg">
                        <span className="text-white text-2xl sm:text-3xl font-bold">
                          {employeeData.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Verified Badge */}
                  <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-1.5 shadow-lg border-2 border-white">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Employee Details */}
              <div className="space-y-2.5">
                {/* Name */}
                <div className="text-center">
                  <p className="text-lg sm:text-xl font-bold text-slate-800">
                    {employeeData.full_name}
                  </p>
                </div>

                {/* NIK & Position Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* NIK */}
                  <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span className="text-xs font-medium text-slate-500">NIK</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">
                      {employeeData.employee_code}
                    </p>
                  </div>

                  {/* Position */}
                  <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-slate-500">Posisi</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">
                      {employeeData.position}
                    </p>
                  </div>
                </div>

                {/* Verification Score Badge */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-white font-bold text-sm sm:text-base">
                      Skor Verifikasi: {verificationScore}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button - Same style as Verification Score Badge */}
          <div className="px-6 pb-4">
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl p-3 shadow-sm hover:shadow-md active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>{actionText}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed Modal - New Design (Same as Success but with X icon and red theme)
  if (!success && employeeData) {
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
                showCheckmark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-180 opacity-0'
              }`}>
                {/* Animated Circle with X */}
                <div className="relative">
                  {/* Outer Ring Animation */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 via-rose-500 to-pink-500 animate-ping opacity-75"></div>
                  
                  {/* Main Circle - Red theme */}
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
                          strokeDashoffset: showCheckmark ? '0' : '166',
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
                          strokeDashoffset: showCheckmark ? '0' : '28',
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
                          strokeDashoffset: showCheckmark ? '0' : '28',
                          transition: 'stroke-dashoffset 0.4s ease-in-out 0.8s'
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Failed Title */}
            <div className="text-center mb-1">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-1">
                Verifikasi Gagal!
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Wajah anda tidak dikenali sebagai
              </p>
            </div>
          </div>

          {/* Employee Profile Card */}
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-br from-slate-50 to-red-50 rounded-2xl p-4 border-2 border-red-100 shadow-inner">
              {/* Profile Photo */}
              <div className="flex justify-center mb-3">
                <div className="relative">
                  {/* Animated Ring - Red theme */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-rose-500 animate-pulse"></div>
                  
                  {/* Photo Container */}
                  <div className="relative bg-white rounded-full p-1">
                    {employeeData.avatar_url ? (
                      <img 
                        src={employeeData.avatar_url} 
                        alt={employeeData.full_name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center border-3 border-white shadow-lg">
                        <span className="text-white text-2xl sm:text-3xl font-bold">
                          {employeeData.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Failed Badge */}
                  <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full p-1.5 shadow-lg border-2 border-white">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Employee Details */}
              <div className="space-y-2.5">
                {/* Name */}
                <div className="text-center">
                  <p className="text-lg sm:text-xl font-bold text-slate-800">
                    {employeeData.full_name}
                  </p>
                </div>

                {/* NIK & Position Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* NIK */}
                  <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span className="text-xs font-medium text-slate-500">NIK</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">
                      {employeeData.employee_code}
                    </p>
                  </div>

                  {/* Position */}
                  <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-slate-500">Posisi</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">
                      {employeeData.position}
                    </p>
                  </div>
                </div>

                {/* Verification Score Badge - Red theme */}
                <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-3 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-white font-bold text-sm sm:text-base">
                      Skor Verifikasi: {verificationScore}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Two buttons side by side */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-2">
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

              {/* Coba Lagi Button */}
              <button
                onClick={() => {
                  handleClose();
                  if (onRetry) {
                    onRetry();
                  } else {
                    window.location.reload();
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl p-3 shadow-sm hover:shadow-md active:scale-98 transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Coba Lagi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: Original Design with Scores (for cases without employeeData)
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

