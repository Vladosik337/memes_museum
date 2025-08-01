// Галерея мемів та API info
export default function MemesGallerySection() {
  return (
    <section className="bg-orange-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Популярні меми з нашої колекції
          </h2>
          <div className="api-info mb-8">
            <h4 className="flex items-center gap-2 justify-center mb-2">
              {/* SVG icon */}
              <span className="icon">🔗</span>
              API для розробників
            </h4>
            <p>Отримайте доступ до нашої колекції мемів через власне API</p>
            <code
              className="block mx-auto my-2 p-2 bg-gray-100 rounded text-orange-700 font-mono text-sm"
              title="Натисніть для копіювання"
            >
              GET https://api.mememuseum.ua/memes
            </code>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="flex flex-col items-center">
                <span className="icon">⚡</span>
                <span>Швидкий доступ</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="icon">⏱️</span>
                <span>Реальний час</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="icon">🗂️</span>
                <span>JSON формат</span>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Натисніть &quot;Завантажити нові меми&quot; щоб побачити більше!
          </p>
          <button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
            Завантажити нові меми
          </button>
        </div>
        {/* Галерея мемів (динамічно/статично) */}
        <section id="memes-gallery" className="mb-8">
          {/* Меми будуть додані через API/JS */}
        </section>
        <div className="gallery-section-gradient"></div>
      </div>
    </section>
  );
}
