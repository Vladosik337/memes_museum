"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import "/public/style.css";
import React, { useState } from "react";

const ProfilePage = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [notification, setNotification] = useState<string | null>(null);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      setNotification("Всі поля обовʼязкові");
      return;
    }
    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user?.email,
        first_name: firstName,
        last_name: lastName,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setNotification("Профіль оновлено!");
      // Можна перезавантажити сторінку або оновити session
      window.location.reload();
    } else {
      setNotification(data.error || "Помилка оновлення");
    }
  };

  return (
    <div className="text-gray-900 min-h-screen dashboard-bg">
      <header className="z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/" className="logo text-gray-900">
                MuseMeme
              </Link>
            </div>
            <div className="text-center text-gray-700 font-medium hidden md:block">
              Особистий кабінет
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 hidden sm:block">
                {user?.first_name ? `Привіт, ${user.first_name}!` : "Вітаємо!"}
              </span>
              <button className="text-gray-900 underline hover:text-orange-600">
                Вийти
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="user-avatar w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  <span>
                    {user?.first_name && user?.last_name
                      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                      : "?"}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.email}
                  </h1>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ласкаво просимо до вашого особистого кабінету. Тут ви можете
                переглядати свої квитки, історію покупок та статистику
                відвідувань.
              </p>
            </div>
          </section>
          <section className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {(!user?.first_name || !user?.last_name) && (
                <form
                  className="max-w-md mx-auto mt-8 space-y-4"
                  onSubmit={handleProfileUpdate}
                >
                  <h2 className="text-xl font-bold mb-4">Заповніть профіль</h2>
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block mb-1"
                    >
                      Ім&#39;я
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      className="form-input w-full px-3 py-2 rounded-lg"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block mb-1"
                    >
                      Прізвище
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className="form-input w-full px-3 py-2 rounded-lg"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    Зберегти
                  </button>
                  {notification && (
                    <div className="mt-2 text-red-600">{notification}</div>
                  )}
                </form>
              )}
              {/* Далі можна додати статистику, квитки, історію покупок */}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
