import { signOut } from "next-auth/react";
import React from "react";

type UserInfoProps = {
  firstName?: string;
  lastName?: string;
  email: string;
};

export const UserInfo: React.FC<UserInfoProps> = ({ firstName, lastName, email }) => {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="user-avatar w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold bg-orange-600">
            <span>
              {firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : "?"}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {firstName && lastName ? `${firstName} ${lastName}` : email}
            </h1>
            <p className="text-gray-600">{email}</p>
          </div>
        </div>
        <button
          className="mt-4 text-gray-900 underline hover:text-orange-600"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Вийти
        </button>
      </div>
    </section>
  );
};
