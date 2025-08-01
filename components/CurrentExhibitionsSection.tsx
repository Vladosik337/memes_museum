// Секція поточних виставок музею мемів
export default function CurrentExhibitionsSection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Поточні виставки
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Виставка 1: Еволюція Пепе */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <span className="text-6xl">🐸</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Еволюція Пепе
              </h3>
              <p className="text-gray-600 mb-4">
                Від коміксу до світового феномену. Історія найвідомішої жаби
                інтернету.
              </p>
              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full mb-4">
                Постійна експозиція
              </span>
              <div className="flex justify-center">
                <a
                  href="/exhibition/pepe"
                  className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Детальніше
                </a>
              </div>
            </div>
          </div>
          {/* Виставка 2: Кращі меми 2024 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <span className="text-6xl">😂</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Кращі меми 2024
              </h3>
              <p className="text-gray-600 mb-4">
                Вірусний контент, який підкорив соцмережі цього року.
              </p>
              <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full mb-4">
                До 31 грудня
              </span>
              <div className="flex justify-center">
                <a
                  href="/exhibition/2024"
                  className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Детальніше
                </a>
              </div>
            </div>
          </div>
          {/* Виставка 3: Меми про космос */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
              <span className="text-6xl">🚀</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Меми про космос
              </h3>
              <p className="text-gray-600 mb-4">
                Від &quot;Houston, we have a problem&quot; до SpaceX мемів.
              </p>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-4">
                Нова виставка
              </span>
              <div className="flex justify-center">
                <a
                  href="/exhibition/space"
                  className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Детальніше
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
