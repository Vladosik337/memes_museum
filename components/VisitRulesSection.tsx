"use client";
import { useEffect, useRef, useState } from "react";

// Секція правил відвідування
export default function VisitRulesSection() {
  const [showModal, setShowModal] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    // focus heading after short delay (for screen readers)
    const t = setTimeout(() => headingRef.current?.focus(), 40);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [showModal]);

  const rules = [
    "Поважайте інших відвідувачів: без токсичності, образ чи дискримінації.",
    "Ніколи не публікуйте персональні дані інших без їх згоди.",
    "Позначайте контент 18+ або чутливий відповідними тегами (NSFW / Spoiler).",
    "Дотримуйтесь авторського права: завантажуйте лише матеріали, на які маєте права або дозвіл.",
    "Заборонені спам, масові однакові пости та будь‑яка автоматизована накрутка.",
    "Не використовуйте уразливості або баги; повідомляйте про них команді.",
    "API використовуйте відповідально: не більше X запитів/хв (rate limit може змінюватися).",
    "Уникайте надмірної реклами та реферальних посилань без змістовного внеску.",
    "Модерація має право приховати або архівувати контент, що порушує правила.",
    "Позитив та креатив вітаються — поширюйте меми етично.",
  ];

  return (
    <section className="bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Готові до відвідування?
        </h3>
        <p className="text-gray-600 mb-3">
          Ознайомтесь з правилами для комфортного досвіду
        </p>
        <button
          className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          onClick={() => setShowModal(true)}
        >
          Переглянути правила відвідування
        </button>
      </div>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-labelledby="visit-rules-heading"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white max-w-2xl w-full rounded-xl shadow-xl ring-1 ring-orange-200 focus:outline-none">
            <button
              aria-label="Закрити"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <div className="px-6 pt-8 pb-6 max-h-[80vh] overflow-y-auto">
              <h4
                id="visit-rules-heading"
                ref={headingRef}
                tabIndex={-1}
                className="text-2xl font-bold mb-6 text-orange-600 tracking-tight text-center"
              >
                Правила музею мемів
              </h4>
              <ol className="list-decimal list-inside text-left text-sm sm:text-base text-gray-800 space-y-3 mb-6">
                {rules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>
            
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Приймаю правила
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-white border border-orange-600 text-orange-700 font-semibold py-2 px-5 rounded-lg hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Закрити
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
