import React from "react";

interface TicketPrice {
  id?: number;
  price?: number;
  valid_from?: string;
  valid_to?: string | null;
  type?: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface TariffFormProps {
  form: TicketPrice;
  setForm: (f: TicketPrice) => void;
  onSave: () => void;
  onCancel: () => void;
}

const TariffForm: React.FC<TariffFormProps> = ({
  form,
  setForm,
  onSave,
  onCancel,
}) => (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-lg font-bold mb-4">
        {form.id ? "Редагувати тариф" : "Новий тариф"}
      </h2>
      <div className="space-y-4">
        <select
          className="w-full border rounded px-3 py-2"
          value={form.type || ""}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="">Оберіть тип квитка</option>
          <option value="weekday">Будній день</option>
          <option value="weekend">Вихідний день</option>
        </select>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Опис"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Ціна (грн)"
          type="number"
          value={form.price || ""}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Діє з (YYYY-MM-DD)"
          type="date"
          value={form.valid_from || ""}
          onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Діє до (YYYY-MM-DD, не обов'язково)"
          type="date"
          value={form.valid_to || ""}
          onChange={(e) => setForm({ ...form, valid_to: e.target.value })}
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={!!form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          <span>Активний тариф</span>
        </label>
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <button
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          onClick={onCancel}
        >
          Скасувати
        </button>
        <button
          className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white font-bold"
          onClick={onSave}
        >
          Зберегти
        </button>
      </div>
    </div>
  </div>
);

export default TariffForm;
