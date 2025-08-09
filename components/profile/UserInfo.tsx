import { signOut } from "next-auth/react";
import React, { useState } from "react";

type UserInfoProps = {
  firstName?: string;
  lastName?: string;
  email: string;
  onProfileUpdate?: (firstName: string, lastName: string) => Promise<void>;
};

export const UserInfo: React.FC<UserInfoProps> = ({
  firstName: initialFirstName,
  lastName: initialLastName,
  email,
  onProfileUpdate,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName || "");
  const [lastName, setLastName] = useState(initialLastName || "");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  React.useEffect(() => {
    setFirstName(initialFirstName || "");
    setLastName(initialLastName || "");
  }, [initialFirstName, initialLastName]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      setNotification("Всі поля обовʼязкові");
      return;
    }
    setLoading(true);
    try {
      if (onProfileUpdate) await onProfileUpdate(firstName, lastName);
      setEditMode(false);
      setNotification("Профіль оновлено!");
    } catch (e) {
      setNotification("Помилка оновлення");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="user-avatar w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold bg-orange-600">
            <span>
              {firstName && lastName
                ? `${firstName[0]}${lastName[0]}`.toUpperCase()
                : "?"}
            </span>
          </div>
          <div>
            {editMode ? (
              <form className="space-y-2" onSubmit={handleSave}>
                <input
                  type="text"
                  className="form-input w-full px-3 py-2 rounded-lg"
                  placeholder="Ім'я"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="text"
                  className="form-input w-full px-3 py-2 rounded-lg"
                  placeholder="Прізвище"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Збереження..." : "Зберегти"}
                </button>
                <button
                  type="button"
                  className="w-full mt-2 text-gray-500 underline"
                  onClick={() => setEditMode(false)}
                  disabled={loading}
                >
                  Скасувати
                </button>
                {notification && (
                  <div className="mt-2 text-red-600">{notification}</div>
                )}
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {firstName && lastName ? `${firstName} ${lastName}` : email}
                </h1>
                <p className="text-gray-600">{email}</p>
                <button
                  className="mt-4 text-gray-900 underline hover:text-orange-600"
                  onClick={() => setEditMode(true)}
                >
                  Редагувати
                </button>
                
              </>
            )}
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ласкаво просимо до вашого особистого кабінету. Тут ви можете
          переглядати свої квитки, історію покупок та статистику відвідувань.
        </p>
      </div>
    </section>
  );
};
