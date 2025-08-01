"use client";
// Секція заклику до дії: кнопки "Купити квиток" та "Випадковий мем"
export default function ActionSection() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2">
            <svg
              className="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={24}
              height={24}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2.993 2.993 0 000 5.82v3a2 2 0 002 2h14a2 2 0 002-2v-3a2.993 2.993 0 000-5.82V7a2 2 0 00-2-2H5z"
              />
            </svg>
            Купити квиток
          </button>
          <button className="btn btn-outline flex items-center gap-2">
            <svg
              className="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={24}
              height={24}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Випадковий мем
          </button>
        </div>
      </div>
    </section>
  );
}
