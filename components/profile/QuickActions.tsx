import React from "react";

type QuickActionsProps = {
  ticketCount: number;
  onDownloadAll: () => void;
};

export const QuickActions: React.FC<QuickActionsProps> = ({
  ticketCount,
  onDownloadAll,
}) => (
  <div className="dashboard-card rounded-xl shadow-lg p-6 mb-6">
    <h3 className="text-xl font-bold text-gray-900 mb-4">Швидкі дії</h3>
    <div className="space-y-3">
      <a
        href="/ticket-purchase-page"
        className="w-full block bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors text-center"
      >
        Придбати новий квиток
      </a>
      <button
        className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
          ticketCount === 0
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-blue-700"
        }`}
        onClick={onDownloadAll}
        disabled={ticketCount === 0}
      >
        Завантажити всі активні квитки
      </button>
      <button
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
        onClick={() => alert("Поділитися враженнями — скоро!")}
      >
        Поділитися враженнями
      </button>
    </div>
  </div>
);
