'use client';

export default function Stats() {
  const stats = [
    {
      value: '99.8%',
      label: 'Akurasi Face Recognition',
      description: 'Tingkat akurasi tertinggi dalam verifikasi wajah',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      value: '< 2',
      suffix: 'detik',
      label: 'Kecepatan Proses',
      description: 'Absensi selesai dalam hitungan detik',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'yellow',
    },
    {
      value: '24/7',
      label: 'Support & Monitoring',
      description: 'Tim support siap membantu kapan saja',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      value: '100%',
      label: 'Data Security',
      description: 'Enkripsi end-to-end untuk keamanan maksimal',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'red',
    },
  ];

  const benefits = [
    {
      title: 'Hemat Waktu',
      description: 'Tidak perlu antre atau input manual. Absensi otomatis dalam 2 detik.',
      emoji: '⚡',
    },
    {
      title: 'Anti Kecurangan',
      description: 'Sistem face recognition mencegah titip absen dan kecurangan lainnya.',
      emoji: '🔒',
    },
    {
      title: 'Laporan Otomatis',
      description: 'Generate laporan kehadiran lengkap dengan sekali klik.',
      emoji: '📊',
    },
    {
      title: 'Scalable',
      description: 'Cocok untuk bisnis kecil hingga enterprise dengan ribuan karyawan.',
      emoji: '📈',
    },
  ];

  return (
    <section id="stats" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Kenapa Kami
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Dipercaya Oleh{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Ribuan Perusahaan
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Teknologi terdepan dengan track record terpercaya untuk solusi absensi Anda
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 lg:p-8 text-center hover:-translate-y-2"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform ${
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                stat.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                'bg-red-100 text-red-600'
              }`}>
                {stat.icon}
              </div>

              {/* Value */}
              <div className="mb-2 sm:mb-3">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-base sm:text-lg lg:text-xl font-semibold text-gray-600 ml-1">
                    {stat.suffix}
                  </span>
                )}
              </div>

              {/* Label */}
              <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-700 mb-1 sm:mb-2">
                {stat.label}
              </p>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
            Keuntungan Menggunakan Absensi Pintar
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                {/* Emoji */}
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">
                  {benefit.emoji}
                </div>

                {/* Title */}
                <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {benefit.title}
                </h4>

                {/* Description */}
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                Terpercaya & Aman
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-white/90">
                Keamanan dan privasi data Anda adalah prioritas kami
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: '🔐', text: 'SSL Encrypted' },
                { icon: '☁️', text: 'Cloud Backup' },
                { icon: '🛡️', text: 'GDPR Compliant' },
                { icon: '✅', text: 'ISO Certified' },
              ].map((badge, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 sm:p-4 text-center hover:bg-white/20 transition-colors"
                >
                  <div className="text-2xl sm:text-3xl mb-2">{badge.icon}</div>
                  <p className="text-xs sm:text-sm font-semibold text-white">{badge.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

