'use client';

export default function Features() {
  const features = [
    {
      icon: (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: 'Face Recognition',
      description: 'Teknologi AI dengan akurasi 99% untuk verifikasi identitas karyawan dalam hitungan detik',
      gradient: 'from-blue-500 to-cyan-600',
      stats: [
        { label: 'Akurasi', value: '99%' },
        { label: 'Kecepatan', value: '< 2s' },
      ],
    },
    {
      icon: (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: 'Real-time Dashboard',
      description: 'Monitor kehadiran karyawan secara real-time dengan dashboard interaktif dan laporan otomatis',
      gradient: 'from-purple-500 to-pink-600',
      stats: [
        { label: 'Update', value: 'Real-time' },
        { label: 'Export', value: 'Auto' },
      ],
    },
    {
      icon: (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      title: 'GPS Location Tracking',
      description: 'Validasi lokasi absensi dengan GPS tracking untuk memastikan karyawan berada di area yang ditentukan',
      gradient: 'from-orange-500 to-red-600',
      stats: [
        { label: 'Radius', value: 'Custom' },
        { label: 'Akurasi', value: '10m' },
      ],
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Fitur Unggulan
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Solusi Absensi Lengkap untuk{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
              Bisnis Modern
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Tingkatkan produktivitas dan efisiensi dengan teknologi terdepan yang mudah digunakan
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

              {/* Content */}
              <div className="relative p-6 sm:p-8">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.gradient} rounded-xl sm:rounded-2xl shadow-lg mb-4 sm:mb-6 text-white group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-gray-100">
                  {feature.stats.map((stat, idx) => (
                    <div key={idx}>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Hover Effect Arrow */}
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features List */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
              Fitur Tambahan
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: '📊', text: 'Laporan Excel/PDF' },
                { icon: '🔔', text: 'Notifikasi Real-time' },
                { icon: '👥', text: 'Multi-user Management' },
                { icon: '🔒', text: 'Data Terenkripsi' },
                { icon: '📱', text: 'Mobile Responsive' },
                { icon: '⚡', text: 'Cloud Storage' },
                { icon: '🎯', text: 'Custom Shift' },
                { icon: '💬', text: '24/7 Support' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <span className="text-2xl sm:text-3xl">{item.icon}</span>
                  <span className="text-sm sm:text-base font-medium text-gray-700">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

