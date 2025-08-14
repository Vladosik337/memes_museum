"use client";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import "/public/style.css";

const LoginPageInner: React.FC = () => {
  const { data: session } = useSession();
  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCallbackUrl = searchParams.get("callbackUrl") || "/profile";
  const [callbackUrl] = useState(initialCallbackUrl);

  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  React.useEffect(() => {
    if (session?.user?.email) {
      // Редірект залежно від ролі
      if (session.user.role === "admin") {
        router.replace("/admin/exhibitions");
      } else {
        router.replace(callbackUrl);
      }
    }
  }, [session, router, callbackUrl]);

  // GitHub OAuth sign in
  const handleGithub = async () => {
    setNotification({ message: "Перенаправляємо до GitHub...", type: "info" });
    await signIn("github", { callbackUrl });
  };

  // Password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email: loginEmail,
      password: loginPassword,
      callbackUrl,
    });
    if (result?.error) {
      setNotification({ message: "Невірний email або пароль", type: "error" });
    } else {
      setNotification({
        message: "Успішний вхід! Перенаправляємо...",
        type: "success",
      });
      setTimeout(() => router.push(callbackUrl), 1200);
    }
  };

  // Password register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      setNotification({ message: "Паролі не співпадають!", type: "error" });
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          firstName: registerFirstName,
          lastName: registerLastName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          message: "Акаунт створено! Виконуємо вхід...",
          type: "success",
        });
        // Автоматичний логін після реєстрації
        const loginResult = await signIn("credentials", {
          redirect: false,
          email: registerEmail,
          password: registerPassword,
          callbackUrl,
        });
        if (!loginResult?.error) {
          setTimeout(() => router.push(callbackUrl), 1200);
        } else {
          setNotification({
            message: "Помилка автоматичного входу",
            type: "error",
          });
        }
      } else {
        setNotification({
          message: data.error || "Помилка реєстрації",
          type: "error",
        });
      }
    } catch {
      setNotification({ message: "Помилка мережі", type: "error" });
    }
  };

  return (
    <div className="auth-bg min-h-screen">
      <nav className="bg-white/90 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="logo text-gray-900">MuseMeme</h1>
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                На головну
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Login Form */}
          {!showRegister && (
            <div
              id="login-form"
              className="auth-card rounded-2xl shadow-2xl p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Вхід до акаунту
                </h2>
                <p className="text-gray-600">
                  Отримайте доступ до своїх квитків та історії покупок
                </p>
              </div>
              <div className="space-y-3 mb-6">
                <button
                  className="oauth-button w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50"
                  onClick={handleGithub}
                >
                  <span className="mr-3" aria-label="GitHub">
                    {/* Heroicons GitHub SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 2C6.477 2 2 6.484 2 12.021c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.088 2.91.832.091-.646.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.138 20.184 22 16.438 22 12.021 22 6.484 17.523 2 12 2z"
                      />
                    </svg>
                  </span>
                  Увійти через GitHub
                </button>
              </div>
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">або</span>
                </div>
              </div>
              <form
                id="password-login-form"
                className="space-y-4"
                onSubmit={handleLogin}
              >
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    required
                    className="form-input w-full px-3 py-2 rounded-lg focus:outline-none"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Пароль
                  </label>
                  <input
                    type="password"
                    id="login-password"
                    name="password"
                    required
                    className="form-input w-full px-3 py-2 rounded-lg focus:outline-none"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Запам{"'"}ятати мене
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-sm text-orange-600 hover:text-orange-500"
                  >
                    Забули пароль?
                  </a>
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Увійти
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                Немає акаунту?
                <span
                  className="toggle-link"
                  style={{ marginLeft: 4 }}
                  onClick={() => setShowRegister(true)}
                >
                  Зареєструйтесь
                </span>
              </p>
            </div>
          )}

          {/* Register Form */}
          {showRegister && (
            <div
              id="register-form"
              className="auth-card rounded-2xl shadow-2xl p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Створити акаунт
                </h2>
                <p className="text-gray-600">
                  Приєднуйтесь до спільноти любителів мемів
                </p>
              </div>
              <form
                id="password-register-form"
                className="space-y-4"
                onSubmit={handleRegister}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="register-firstname">Ім{"'"}я</label>
                    <input
                      id="register-firstname"
                      type="text"
                      placeholder="Іван"
                      className="form-input w-full px-3 py-2 rounded-lg focus:outline-none"
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="register-lastname">Прізвище</label>
                    <input
                      id="register-lastname"
                      type="text"
                      placeholder="Петренко"
                      className="form-input w-full px-3 py-2 rounded-lg focus:outline-none"
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-email">Email</label>
                  <input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    className="form-input w-full px-3 py-2 rounded-lg focus:outline-none"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="register-password">Пароль</label>
                  <input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    className="form-input w-full px-3 py-2 rounded-lg focus:outline-none"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="register-confirm-password">
                    Підтвердіть пароль
                  </label>
                  <input
                    id="register-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="form-input w-full px-3 py-2 rounded-lg focus:outline-none"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Створити акаунт
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                Вже маєте акаунт?
                <span
                  className="toggle-link"
                  style={{ marginLeft: 4 }}
                  onClick={() => setShowRegister(false)}
                >
                  Увійдіть
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-transform duration-300 text-white ${
            notification.type === "success"
              ? "bg-green-500"
              : notification.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

const LoginPage: React.FC = () => (
  <Suspense fallback={<div />}>
    <LoginPageInner />
  </Suspense>
);

export default LoginPage;
