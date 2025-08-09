import type { Purchase } from "@/types/profile";
import React from "react";

type PurchaseHistoryProps = {
  purchases: Purchase[];
  onFilterChange?: (filter: { type: "all" | "active" | "expired" }) => void;
  onDateChange?: (from: string, to: string) => void;
  dateFrom?: string;
  dateTo?: string;
};

export const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({
  purchases,
  onFilterChange,
  onDateChange,
  dateFrom,
  dateTo,
}) => {
  const [localFrom, setLocalFrom] = React.useState(dateFrom || "");
  const [localTo, setLocalTo] = React.useState(dateTo || "");
  const [warning, setWarning] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocalFrom(dateFrom || "");
    setLocalTo(dateTo || "");
  }, [dateFrom, dateTo]);

  return (
    <div className="dashboard-card rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        Історія покупок
        <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
          {purchases.length}
        </span>
      </h2>
      {/* Фільтри */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          onChange={(e) =>
            onFilterChange?.({
              type: e.target.value as "all" | "active" | "expired",
            })
          }
        >
          <option value="all">Всі покупки</option>
          <option value="active">Активні квитки</option>
          <option value="expired">Старі квитки</option>
        </select>
        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          value={localFrom}
          onChange={(e) => setLocalFrom(e.target.value)}
        />
        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          value={localTo}
          onChange={(e) => setLocalTo(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          onClick={() => {
            if (!localFrom && localTo) {
              setWarning("Оберіть спочатку дату 'від'");
              return;
            }
            // Дозволяємо: лише дату 'від', або і 'від', і 'до'
            if (localTo && localFrom && localTo < localFrom) {
              setWarning("Дата 'до' не може бути раніше за дату 'від'");
              return;
            }
            setWarning(null);
            onDateChange?.(localFrom, localTo);
          }}
        >
          Застосувати фільтри
        </button>
        {warning && (
          <div className="text-red-600 text-sm mt-2 w-full">{warning}</div>
        )}
      </div>
      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Історія покупок порожня
          </h3>
          <p className="text-gray-500">
            Ваші майбутні покупки з&#39;являться тут
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="py-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-bold">Покупка #{purchase.id}</div>
                  <div className="text-sm text-gray-600">{purchase.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ₴{purchase.total}
                  </div>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      purchase.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : purchase.status === "active"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {purchase.status === "completed"
                      ? "Завершена"
                      : purchase.status === "active"
                      ? "Активна"
                      : "Стара"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                {purchase.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 rounded p-2 bg-gray-50 flex flex-col"
                  >
                    <span className="font-medium text-gray-900">
                      {ticket.firstName} {ticket.lastName}
                    </span>
                    <span className="text-xs text-gray-500">
                      Квиток #{ticket.number}
                    </span>
                    <span className="text-xs text-gray-500">
                      {ticket.status === "active" ? "Активний" : "Старий"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
