"use client";
import { useState } from "react";

// Секція правил відвідування
export default function VisitRulesSection() {
  const [showModal, setShowModal] = useState(false);
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
          className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          onClick={() => setShowModal(true)}
        >
          Переглянути правила відвідування
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-xl relative">
            <h4 className="text-2xl font-bold mb-6 text-orange-600">
              Правила музею мемів
            </h4>
            <ul className="text-lg text-gray-800 mb-6 space-y-4">
              <li>1. Нікому не казати за правила музею</li>
              <li>2. Дотримуватись правил музею</li>
              <li>3. Веселитись!</li>
            </ul>
            <button
              className="mt-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
              onClick={() => setShowModal(false)}
            >
              Закрити
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
