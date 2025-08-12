"use client";
import TariffForm from "@/components/admin/tariffs/TariffForm";
import TariffTable from "@/components/admin/tariffs/TariffTable";
import { useMemo, useState } from "react";
import useSWR from "swr";

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

export default function TariffsClient() {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, mutate } = useSWR("/api/admin/ticket-prices", fetcher);
  const [editing, setEditing] = useState<TicketPrice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<TicketPrice>>({});

  const prices = useMemo(() => data?.prices || [], [data]);

  const handleEdit = (price: TicketPrice) => {
    setEditing(price);
    setForm(price);
    setShowForm(true);
  };
  const handleCreate = () => {
    setEditing(null);
    setForm({
      type: "",
      price: 0,
      valid_from: "",
      valid_to: "",
      description: "",
      is_active: true,
    });
    setShowForm(true);
  };
  const handleSave = async () => {
    if (editing) {
      await fetch(`/api/admin/ticket-prices/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch(`/api/admin/ticket-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    mutate();
  };
  const handleRadioChange = async (type: string, id: number) => {
    if (!prices) return;
    const requests = prices
      .filter((p: TicketPrice) => p.type === type)
      .map((p: TicketPrice) =>
        fetch(`/api/admin/ticket-prices/${p.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: p.id === id }),
        })
      );
    await Promise.all(requests);
    mutate();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Керування тарифами на квитки</h1>
      <div className="mb-4">
        <div className="border border-orange-200 bg-orange-50 rounded-lg p-3 text-gray-700 text-sm">
          <span className="font-semibold text-orange-600">Тип квитка:</span>{" "}
          <span className="font-semibold text-orange-600">weekday</span> — будні
          дні, <span className="font-semibold text-orange-600">weekend</span> —
          вихідні.
          <br />
          Для кожного типу може бути активним лише <b>один</b> тариф одночасно
          (як радіокнопка). Якщо ви активуєте новий тариф, попередній
          автоматично стане неактивним. <br />
          <b>Увага:</b> хоча б один тариф для кожного типу має бути активним
          завжди. Неможливо залишити тип без активного тарифу.
          <br />
          Натисніть на статус{" "}
          <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">
            Активний
          </span>{" "}
          або{" "}
          <span className="inline-block px-2 py-1 rounded bg-gray-200 text-gray-500 text-xs font-bold">
            Неактивний
          </span>
          , щоб змінити його.
        </div>
      </div>
      <button
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold mb-4"
        onClick={handleCreate}
      >
        + Створити новий тариф
      </button>
      <TariffTable
        prices={prices}
        onEdit={handleEdit}
        onRadioChange={handleRadioChange}
      />
      {showForm && (
        <TariffForm
          form={form}
          setForm={(f) => setForm(f)}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
