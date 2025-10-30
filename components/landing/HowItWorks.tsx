'use client';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Training Wajah',
      description: 'Karyawan mendaftar dan melakukan training wajah sekali saja. Proses cepat hanya 2-3 menit.',
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'blue',
      details: ['📸 Capture 3-5 foto wajah', '🤖 AI processing otomatis', '✅ Verifikasi instant'],
    },
    {
      number: '02',
      title: 'Check-in/Check-out',
      description: 'Karyawan absen dengan scan wajah melalui kamera. Data langsung tercatat otomatis ke sistem.',
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'purple',
      details: ['⚡ Proses < 2 detik', '📍 Validasi GPS lokasi', '📊 Data real-time'],
    },
    {
      number: '03',
      title: 'Monitoring & Laporan',
      description: 'Admin memantau kehadiran real-time dan download laporan lengkap untuk periode tertentu.',
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'indigo',
      details: ['📈 Dashboard analytics', '📥 Export Excel/PDF', '🔔 Alert otomatis'],
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Cara Kerja
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Setup dalam{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              3 Langkah Mudah
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Mulai gunakan sistem absensi pintar dalam waktu singkat tanpa ribet
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 sm:space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-0"></div>
              )}

              {/* Card */}
              <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border-2 border-gray-100 hover:border-blue-200 group">
                {/* Number Badge */}
                <div className={`absolute -top-4 -right-4 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                  step.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  step.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  'bg-gradient-to-br from-indigo-500 to-indigo-600'
                }`}>
                  <span className="text-white font-bold text-sm sm:text-base">{step.number}</span>
                </div>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform ${
                  step.color === 'blue' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600' :
                  step.color === 'purple' ? 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600' :
                  'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600'
                }`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* Details List */}
                <ul className="space-y-2 sm:space-y-3">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                      <span className="text-base sm:text-lg flex-shrink-0">{detail.split(' ')[0]}</span>
                      <span>{detail.substring(detail.indexOf(' ') + 1)}</span>
                    </li>
                  ))}
                </ul>

                {/* Hover Indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl sm:rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${
                  step.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  step.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  'bg-gradient-to-r from-indigo-500 to-indigo-600'
                }`}></div>
              </div>

              {/* Connector Arrow (Mobile) */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-6 lg:hidden">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Siap Memulai?
            </h3>
            <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Daftar sekarang dan rasakan kemudahan sistem absensi modern
            </p>
            <a href="/admin" className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-700 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Mulai Sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

