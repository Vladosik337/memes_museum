"use client";
import { useTicketFormUser } from "@/hooks/useTicketFormUser";
import { generateTicketPDF } from "@/utils/generateTicketPDF";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import "svg2pdf.js";

export default function TicketPurchasePage() {
  const user = {
    firstName: "",
    lastName: "",
    email: "",
  };

  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    date: "",
    comment: "",
    guests: [] as Array<{ firstName: string; lastName: string }>,
  });
  // інтеграція next-auth
  const {
    isAuthenticated,
    loading: authLoading,
    signIn,
  } = useTicketFormUser(setForm);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ticketsData, setTicketsData] = useState<
    Array<{
      number: string;
      qr_code: string;
      first_name: string;
      last_name: string;
    }>
  >([]);

  // Статичні ціни
  const WEEKDAY_PRICE = 250;
  const WEEKEND_PRICE = 350;

  // Визначення ціни за основний квиток
  function getBasePrice(dateStr: string): number {
    if (!dateStr) return WEEKDAY_PRICE;
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 = неділя, 6 = субота
    return day === 0 || day === 6 ? WEEKEND_PRICE : WEEKDAY_PRICE;
  }

  // Сума: за кожного гостя — повна ціна квитка
  const totalPrice = getBasePrice(form.date) * (1 + form.guests.length);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addGuest = () => {
    setForm({
      ...form,
      guests: [...form.guests, { firstName: "", lastName: "" }],
    });
  };

  const handleGuestChange = (
    i: number,
    field: "firstName" | "lastName",
    value: string
  ) => {
    const guests = [...form.guests];
    guests[i][field] = value;
    setForm({ ...form, guests });
  };

  function validateForm(): string | null {
    if (!form.firstName.trim()) return "Вкажіть ім'я";
    if (!form.lastName.trim()) return "Вкажіть прізвище";
    if (!form.email.trim() || !form.email.includes("@"))
      return "Некоректний email";
    if (!form.date.trim()) return "Вкажіть дату";

    // Перевірка дати
    const now = new Date();
    const visitDate = new Date(form.date);
    visitDate.setHours(0, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (visitDate < today) return "Неможливо купити квиток на минулі дні";

    // Перевірка часу (тільки якщо купується на сьогодні)
    if (visitDate.getTime() === today.getTime()) {
      const currentHour = now.getHours();
      if (currentHour < 10 || currentHour >= 17) {
        return "Квитки можна купити лише з 10:00 до 17:00 (за годину до закриття)";
      }
    }
    return null;
  }

  function handleSummary(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowSummary(true);
  }

  async function handlePayment() {
    setPaymentLoading(true);
    setError(null);
    setSuccess(null);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setPaymentLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          date: form.date,
          comment: form.comment,
          guests: form.guests,
          userId: 1, // замінити на реальний userId
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Помилка покупки");
      setSuccess("Квитки успішно заброньовано!");
      setTicketsData(
        data.tickets.map(
          (t: {
            number: string;
            qr_code: string;
            first_name: string;
            last_name: string;
          }) => ({
            number: t.number,
            qr_code: t.qr_code,
            first_name: t.first_name,
            last_name: t.last_name,
          })
        )
      );
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        date: "",
        comment: "",
        guests: [],
      });
      setPaymentSuccess(true);
      setShowSummary(false);
      console.log("[Payment] success", { ticketsData: data.tickets });
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Помилка покупки");
      }
    } finally {
      setPaymentLoading(false);
    }
  }

  return (
    <>
      <header className="z-40 w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="logo text-gray-900 hover:text-orange-600 transition-colors text-2xl font-bold"
              >
                MuseMeme
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <Link
                  href="/profile"
                  className="underline hover:text-orange-800"
                >
                  До профілю
                </Link>
              )}
              <button
                className="text-gray-900 underline hover:text-orange-600"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Вийти
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">
            Купівля квитка
          </h2>
          {!isAuthenticated && !authLoading && (
            <div className="mb-6 text-center">
              <button
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg mb-2"
                onClick={() =>
                  signIn(undefined, { callbackUrl: "/ticket-purchase-page" })
                }
              >
                Авторизуватись
              </button>
              <div className="text-gray-500 text-sm">
                або заповніть форму нижче
              </div>
            </div>
          )}
          <div className="mb-6 text-center">
            <span className="font-bold text-lg text-orange-700">
              Сума до оплати: {totalPrice}₴
            </span>
          </div>
          <form className="space-y-6" onSubmit={handleSummary}>
            <div className="flex gap-4">
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Ім'я"
                className="w-1/2 px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Прізвище"
                className="w-1/2 px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              placeholder="Коментар (опціонально)"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <div>
              <div className="font-bold mb-2">Додати гостей:</div>
              {form.guests.map((guest, i) => (
                <div key={i} className="flex gap-4 mb-2 items-center">
                  <input
                    type="text"
                    value={guest.firstName}
                    onChange={(e) =>
                      handleGuestChange(i, "firstName", e.target.value)
                    }
                    placeholder="Ім'я особи"
                    className="w-1/2 px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    value={guest.lastName}
                    onChange={(e) =>
                      handleGuestChange(i, "lastName", e.target.value)
                    }
                    placeholder="Прізвище особи"
                    className="w-1/2 px-4 py-2 border rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    className="ml-2 text-orange-600 hover:text-red-600 text-xl font-bold px-2"
                    aria-label="Видалити гостя"
                    onClick={() => {
                      setForm({
                        ...form,
                        guests: form.guests.filter((_, idx) => idx !== i),
                      });
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-2 px-4 rounded-lg mt-2"
                onClick={addGuest}
              >
                + Купити квиток другу
              </button>
            </div>
            {error && (
              <div className="text-red-600 text-center font-bold mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 text-center font-bold mb-4">
                {success}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
              disabled={loading}
            >
              {loading ? "Завантаження..." : "Забронювати квиток/квитки"}
            </button>
          </form>
          {showSummary && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border-2 border-orange-400">
                <h4 className="text-2xl font-bold mb-6 text-orange-600">
                  Підсумок замовлення
                </h4>
                <div className="mb-4 text-left">
                  <div className="font-bold">
                    Ім&amp;#39;я: {form.firstName}
                  </div>
                  <div className="font-bold">Прізвище: {form.lastName}</div>
                  <div className="font-bold">Email: {form.email}</div>
                  <div className="font-bold">Дата: {form.date}</div>
                  <div className="font-bold">
                    Кількість гостей: {form.guests.length}
                  </div>
                  <div className="font-bold">Сума до оплати: {totalPrice}₴</div>
                </div>
                <div className="text-orange-700 mb-4 text-sm">
                  Після оплати квитки надійдуть на вказану ел. адресу
                  {isAuthenticated ? " та з'являться у вашому профілі" : ""}.
                </div>
                <button
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg mb-4 transition-colors duration-300 shadow-lg w-full"
                  onClick={handlePayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? "Оплата..." : "Оплатити"}
                </button>
                <button
                  className="mt-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-2 px-6 rounded-lg transition-colors duration-300 shadow w-full"
                  onClick={() => setShowSummary(false)}
                >
                  Назад
                </button>
              </div>
            </div>
          )}
          {paymentSuccess && ticketsData.length > 0 && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white p-8 max-w-md w-full text-center shadow-2xl max-h-[80vh] overflow-y-auto">
                <h4 className="text-2xl font-bold mb-6 text-green-600">
                  Оплата успішна!
                </h4>
                <div className="mb-4 text-left">
                  <div className="font-bold">Квитки заброньовано.</div>
                  <div className="font-bold">Сума: {totalPrice}₴</div>
                  <div className="font-bold">
                    Квитки надіслані на email: {form.email}
                  </div>
                  <div className="font-bold">
                    Можна переглянути у профілі користувача.
                  </div>
                  <div className="mt-4 flex flex-col items-center gap-4">
                    {ticketsData.map((t) => (
                      <div
                        key={t.number}
                        className="p-4 w-full flex flex-col items-center bg-gray-50"
                      >
                        <span className="font-bold mb-1">
                          {t.first_name} {t.last_name}
                        </span>
                        <QRCodeSVG
                          value={t.qr_code}
                          size={128}
                          id={`qr-svg-${t.number}`}
                        />
                        <div className="text-xs mt-2 mb-2">
                          Номер: {t.number}
                        </div>
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 mb-2 transition-colors duration-300 shadow w-full"
                          onClick={() => {
                            const svg = document.getElementById(
                              `qr-svg-${t.number}`
                            );
                            if (svg) {
                              const serializer = new XMLSerializer();
                              const source = serializer.serializeToString(svg);
                              const blob = new Blob([source], {
                                type: "image/svg+xml;charset=utf-8",
                              });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `ticket-${t.number}.svg`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            }
                          }}
                        >
                          Завантажити квиток (SVG)
                        </button>
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 mb-2 transition-colors duration-300 shadow w-full"
                          onClick={() => {
                            generateTicketPDF({
                              museumName: "Музей Мемів",
                              firstName: t.first_name,
                              lastName: t.last_name,
                              ticketNumber: t.number,
                              visitDate: form.date,
                              qrSvgId: `qr-svg-${t.number}`,
                            });
                          }}
                        >
                          Завантажити квиток (PDF)
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="mt-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-2 px-6 transition-colors duration-300 shadow w-full"
                  onClick={() => {
                    setPaymentSuccess(false);
                    setTicketsData([]);
                  }}
                >
                  Закрити
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
