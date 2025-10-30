'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      {/* Animated Background - Responsive */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Mobile: Smaller blobs, less movement */}
        <div className="absolute -top-20 -left-20 sm:-top-40 sm:-left-40 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-purple-500/20 sm:bg-purple-500/30 rounded-full filter blur-2xl sm:blur-3xl animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 sm:-bottom-40 sm:-right-40 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-cyan-500/20 sm:bg-cyan-500/30 rounded-full filter blur-2xl sm:blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-pink-500/10 sm:bg-pink-500/20 rounded-full filter blur-2xl sm:blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay - Smaller on mobile */}
      <div className="absolute inset-0 bg-grid-white/5 sm:bg-grid-white/5"></div>
      
      {/* Gradient Overlay for better text readability on mobile */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Sistem Absensi Modern & Terpercaya
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Kelola Absensi Karyawan dengan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                Face Recognition
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
              Sistem absensi modern dengan verifikasi wajah, real-time dashboard, dan laporan otomatis. Tingkatkan efisiensi dan akurasi data kehadiran karyawan Anda.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link
                href="/admin"
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-700 text-base sm:text-lg font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Mulai Sekarang
              </Link>
              <button
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-base sm:text-lg font-bold rounded-xl hover:bg-white/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Lihat Cara Kerja
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-white/70 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Mudah Digunakan
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Setup Cepat
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Support 24/7
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview - Clean & Professional */}
          <div className="relative mt-12 lg:mt-0">
            <div className="relative max-w-md mx-auto lg:max-w-none space-y-3 sm:space-y-4">
              {/* Top Cards Row - Check-in & Check-out */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Check-in Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 animate-float hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Check-in</p>
                      <p className="text-sm sm:text-base font-bold text-gray-900">08:00</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Akurasi: 99.8%</div>
                </div>

                {/* Check-out Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 animate-float animation-delay-2000 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Check-out</p>
                      <p className="text-sm sm:text-base font-bold text-gray-900">17:00</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Durasi: 9 jam</div>
                </div>
              </div>

              {/* Main Dashboard - Attendance Chart */}
              <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-5 lg:p-6 border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">Statistik Kehadiran</h3>
                    <p className="text-xs text-gray-500">Minggu ini</p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-100 rounded-lg">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs sm:text-sm font-bold text-green-700">95%</span>
                  </div>
                </div>

                {/* Combined Bar + Line Chart */}
                <div className="mb-5 sm:mb-6">
                  <div className="relative">
                    {/* Bar Chart Container with proper spacing */}
                    <div className="flex items-end justify-between gap-3 sm:gap-4 lg:gap-5 h-36 sm:h-44 lg:h-52 relative px-2">
                      {/* Senin - 75% */}
                      <div className="flex-1 flex flex-col items-center gap-2.5 sm:gap-3 relative group">
                        <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer shadow-lg relative" style={{ height: '75%' }}>
                          {/* Percentage Label - Larger & Clearer */}
                          <div className="absolute inset-x-0 top-3 sm:top-4 text-center">
                            <span className="text-sm sm:text-base lg:text-lg font-extrabold text-white drop-shadow-lg">75%</span>
                          </div>
                          {/* Dot for line chart */}
                          <div className="absolute -top-2.5 sm:-top-3 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 border-2 sm:border-3 border-white rounded-full shadow-lg z-10"></div>
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="bg-gray-900 text-white text-xs sm:text-sm px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                              Senin: 15 Hadir
                            </div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Sen</span>
                      </div>

                      {/* Selasa - 85% */}
                      <div className="flex-1 flex flex-col items-center gap-2.5 sm:gap-3 relative group">
                        <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer shadow-lg relative" style={{ height: '85%' }}>
                          <div className="absolute inset-x-0 top-3 sm:top-4 text-center">
                            <span className="text-sm sm:text-base lg:text-lg font-extrabold text-white drop-shadow-lg">85%</span>
                          </div>
                          <div className="absolute -top-2.5 sm:-top-3 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 border-2 sm:border-3 border-white rounded-full shadow-lg z-10"></div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="bg-gray-900 text-white text-xs sm:text-sm px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                              Selasa: 17 Hadir
                            </div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Sel</span>
                      </div>

                      {/* Rabu - 65% */}
                      <div className="flex-1 flex flex-col items-center gap-2.5 sm:gap-3 relative group">
                        <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer shadow-lg relative" style={{ height: '65%' }}>
                          <div className="absolute inset-x-0 top-3 sm:top-4 text-center">
                            <span className="text-sm sm:text-base lg:text-lg font-extrabold text-white drop-shadow-lg">65%</span>
                          </div>
                          <div className="absolute -top-2.5 sm:-top-3 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 border-2 sm:border-3 border-white rounded-full shadow-lg z-10"></div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="bg-gray-900 text-white text-xs sm:text-sm px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                              Rabu: 13 Hadir
                            </div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Rab</span>
                      </div>

                      {/* Kamis - 95% (Highlighted) */}
                      <div className="flex-1 flex flex-col items-center gap-2.5 sm:gap-3 relative group">
                        <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-xl hover:from-indigo-700 hover:to-indigo-600 transition-all cursor-pointer shadow-xl relative" style={{ height: '95%' }}>
                          <div className="absolute inset-x-0 top-3 sm:top-4 text-center">
                            <span className="text-sm sm:text-base lg:text-lg font-extrabold text-white drop-shadow-lg">95%</span>
                          </div>
                          <div className="absolute -top-2.5 sm:-top-3 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 border-2 sm:border-3 border-white rounded-full shadow-lg z-10"></div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="bg-gray-900 text-white text-xs sm:text-sm px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                              Kamis: 19 Hadir ⭐
                            </div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Kam</span>
                      </div>

                      {/* Jumat - 80% */}
                      <div className="flex-1 flex flex-col items-center gap-2.5 sm:gap-3 relative group">
                        <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer shadow-lg relative" style={{ height: '80%' }}>
                          <div className="absolute inset-x-0 top-3 sm:top-4 text-center">
                            <span className="text-sm sm:text-base lg:text-lg font-extrabold text-white drop-shadow-lg">80%</span>
                          </div>
                          <div className="absolute -top-2.5 sm:-top-3 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 border-2 sm:border-3 border-white rounded-full shadow-lg z-10"></div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="bg-gray-900 text-white text-xs sm:text-sm px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                              Jumat: 16 Hadir
                            </div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Jum</span>
                      </div>

                      {/* SVG Line connecting dots */}
                      <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                        {/* Line path - responsive calculation */}
                        <path
                          d="M 10% 25%, L 30% 15%, L 50% 35%, L 70% 5%, L 90% 20%"
                          stroke="url(#lineGradient)"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-lg"
                        />
                        {/* Gradient definition */}
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Legend - Enhanced */}
                    <div className="flex items-center justify-center gap-6 sm:gap-8 mt-4 sm:mt-5 pb-1">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-500 to-blue-400 rounded shadow-sm"></div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Jumlah Hadir</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full shadow-sm"></div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Trend Kehadiran</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">48</p>
                    <p className="text-xs text-gray-500">Hadir</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">95%</p>
                    <p className="text-xs text-gray-500">Akurasi</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">2</p>
                    <p className="text-xs text-gray-500">Izin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
        <svg
          className="w-6 h-6 text-white/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(10px, -25px) scale(1.05);
          }
          50% {
            transform: translate(-10px, 10px) scale(0.95);
          }
          75% {
            transform: translate(25px, 25px) scale(1.02);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.02);
          }
        }

        .animate-blob {
          animation: blob 8s ease-in-out infinite;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-grid-white\/5 {
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        /* Desktop: Larger grid */
        @media (min-width: 640px) {
          .bg-grid-white\/5 {
            background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 50px 50px;
          }
        }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          .animate-blob,
          .animate-float,
          .animate-bounce {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

