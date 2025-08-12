import React from "react";

interface TicketPrice {
  id: number;
  price: number;
  valid_from: string;
  valid_to?: string | null;
  type: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface TariffTableProps {
  prices: TicketPrice[];
  onEdit: (p: TicketPrice) => void;
  onRadioChange: (type: string, id: number) => void;
}

const TariffTable: React.FC<TariffTableProps> = ({
  prices,
  onEdit,
  onRadioChange,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-orange-200 rounded-lg shadow-sm">
      <thead className="bg-orange-50 border-b border-orange-200">
        <tr>
          <th className="px-4 py-2 text-left text-orange-700 font-semibold">
            Тип
          </th>
          <th className="px-4 py-2 text-left text-orange-700 font-semibold">
            Опис
          </th>
          <th className="px-4 py-2 text-left text-orange-700 font-semibold">
            Ціна
          </th>
          <th className="px-4 py-2 text-left text-orange-700 font-semibold">
            Діє з
          </th>
          <th className="px-4 py-2 text-left text-orange-700 font-semibold">
            Діє до
          </th>
          <th className="px-4 py-2 text-left text-orange-700 font-semibold">
            Статус
          </th>
          <th className="px-4 py-2 text-left text-orange-700 font-semibold">
            Дії
          </th>
        </tr>
      </thead>
      <tbody>
        {prices.map((p) => (
          <tr key={p.id} className={p.is_active ? "border-t border-gray-300 last:border-b hover:bg-orange-50/40 transition" : "opacity-50 bg-gray-50 border-t border-gray-300 last:border-b hover:bg-orange-50/40 transition"}>
            <td className="px-4 py-2 font-semibold">
              <span
                className={
                  p.type === "weekday"
                    ? "text-orange-600"
                    : p.type === "weekend"
                    ? "text-orange-500"
                    : "text-gray-700"
                }
              >
                {p.type}
              </span>
            </td>
            <td className="px-4 py-2">{p.description}</td>
            <td className="px-4 py-2 font-bold text-lg text-orange-700">
              {p.price}₴
            </td>
            <td className="px-4 py-2">{p.valid_from}</td>
            <td className="px-4 py-2">{p.valid_to || "—"}</td>
            <td className="px-4 py-2">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name={`active-radio-${p.type}`}
                  value={p.id}
                  checked={p.is_active}
                  onChange={() => onRadioChange(p.type, p.id)}
                  className="hidden"
                />
                <span
                  className={`px-3 py-1 rounded text-xs font-bold border select-none ${
                    p.is_active
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-200 text-gray-500 border-gray-300"
                  }`}
                >
                  {p.is_active ? "Активний" : "Неактивний"}
                </span>
              </label>
            </td>
            <td className="px-4 py-2">
              <button
                className="text-orange-700 hover:underline mr-2 font-semibold"
                onClick={() => onEdit(p)}
              >
                Редагувати
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TariffTable;
