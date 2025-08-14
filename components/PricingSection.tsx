"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";

// Секція ціни на квитки та додаткові послуги
export default function PricingSection() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const { data: pricesData } = useSWR<{
    prices: { type: string; price: number }[];
  }>("/api/ticket-prices", (url: string) =>
    fetch(url).then(
      (r) => r.json() as Promise<{ prices: { type: string; price: number }[] }>
    )
  );
  const weekdayPrice =
    pricesData?.prices.find((p) => p.type === "weekday")?.price ?? 250;
  const weekendPrice =
    pricesData?.prices.find((p) => p.type === "weekend")?.price ?? 350;

  const handleOrderClick = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = неділя, 1 = понеділок, ..., 6 = субота
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekdayCard = document.getElementById("weekday-card");
    const weekendCard = document.getElementById("weekend-card");
    if (weekdayCard && weekendCard) {
      if (isWeekend) {
        weekendCard.style.border = "3px solid #ea580c";
        weekdayCard.style.border = "none";
      } else {
        weekdayCard.style.border = "3px solid #ea580c";
        weekendCard.style.border = "none";
      }
    }
  }, []);

  return (
    <section id="pricing" className="pricing py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Ціни на квитки
        </h2>
        <div className="pricing-cards">
          <div className="pricing-card" id="weekday-card">
            <h3>Будні дні</h3>
            <div className="price">
              <span className="currency">₴</span>
              <span className="amount">{weekdayPrice}</span>
            </div>
            <ul className="pricing-features">
              <li>✅ Повний доступ до всіх виставок</li>
              <li>✅ Інтерактивні зони</li>
              <li>✅ Фото-зони</li>
              <li>✅ Безкоштовний Wi-Fi</li>
            </ul>
            <Link href="/ticket-purchase-page">
              <span className="btn btn-outline">Купити квиток</span>
            </Link>
          </div>
          <div className="pricing-card" id="weekend-card">
            <h3>Вихідні дні</h3>
            <div className="price">
              <span className="currency">₴</span>
              <span className="amount">{weekendPrice}</span>
            </div>
            <ul className="pricing-features">
              <li>✅ Повний доступ до всіх виставок</li>
              <li>✅ Інтерактивні зони</li>
              <li>✅ Фото-зони</li>
              <li>✅ Безкоштовний Wi-Fi</li>
            </ul>
            <Link href="/ticket-purchase-page">
              <span className="btn btn-outline">Купити квиток</span>
            </Link>
          </div>
        </div>
        {/* Додаткові опції */}
        <div className="additional-options">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Додаткові послуги
          </h3>
          <div className="options-grid">
            <div className="option-card">
              <div className="option-icon">👥</div>
              <h4>Груповий квиток</h4>
              <p className="option-description">Від 10 осіб</p>
              <div className="option-price">
                <span className="price-text">700₴</span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => handleOrderClick("Груповий квиток")}
              >
                Замовити
              </button>
            </div>
            <div className="option-card">
              <div className="option-icon">🎨</div>
              <h4>Майстер-клас</h4>
              <p className="option-description">
                Створення мемів з професіоналом
              </p>
              <div className="option-price">
                <span className="price-text">+150₴</span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => handleOrderClick("Майстер-клас")}
              >
                Замовити
              </button>
            </div>
            <div className="option-card">
              <div className="option-icon">🎉</div>
              <h4>Івенти та покази</h4>
              <p className="option-description">
                Спеціальні заходи та презентації
              </p>
              <div className="option-price">
                <span className="price-text">+100₴</span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => handleOrderClick("Івенти та покази")}
              >
                Замовити
              </button>
            </div>
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative ">
              <h4 className="text-2xl font-bold mb-6 text-orange-600">
                Замовлення: {modalType}
              </h4>
              <div className="mb-6">
                <div className="text-lg text-gray-800 mb-2">
                  Телефонуйте для замовлення:
                </div>
                <div className="font-bold text-xl text-orange-700 mb-4">
                  +38 (044) 123-45-67
                </div>
              </div>
              <Link href="/ticket-purchase-page">
                <span className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg mb-4 transition-colors duration-300 shadow-lg mx-5 cursor-pointer block">
                  Купити вхідний квиток
                </span>
              </Link>
              <button
                className="mt-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-2 px-6 rounded-lg transition-colors duration-300 shadow"
                onClick={() => setShowModal(false)}
              >
                Закрити
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
