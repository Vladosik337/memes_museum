// Footer з контактами та описом
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Логотип та опис */}
          <div className="lg:col-span-2 mb-6">
            <h2 className="logo text-3xl text-white mb-2">MuseMeme</h2>
            <p className="text-orange-400 font-medium">
              Перший в Україні музей мемів!
            </p>
            <p className="text-gray-300 leading-relaxed mb-6">
              Занурся в історію інтернет-культури! Від перших мемів 90-х до
              вірусних хітів сьогодення. Ми зберігаємо та популяризуємо цифрову
              спадщину людства.
            </p>
          </div>
          {/* Контакти */}
          <div>
            <h4 className="font-bold mb-2">Контакти</h4>
            <ul className="text-gray-300 space-y-2">
              <li>м. Київ, вул. Мемна, 1</li>
              <li>+38 (044) 123-45-67</li>
              <li>info@mememuseum.ua</li>
            </ul>
          </div>
          {/* Соцмережі */}
          <div>
            <h4 className="font-bold mb-2">Ми в соцмережах</h4>
            <ul className="text-gray-300 space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center text-gray-400 text-sm">
          © 2025 MuseMeme. Всі права захищено.
        </div>
      </div>
    </footer>
  );
}
