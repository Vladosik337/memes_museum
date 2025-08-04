import React from "react";

type UserStatsProps = {
  totalVisits: number;
  activeTickets: number;
  totalSpent: number;
  memberSince: string;
};

export const UserStats: React.FC<UserStatsProps> = ({
  totalVisits,
  activeTickets,
  totalSpent,
  memberSince,
}) => (
  <section className="bg-gray-50 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ваша статистика
        </h2>
        <p className="text-gray-600">Огляд вашої активності в музеї</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-300">
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {totalVisits}
          </div>
          <div className="text-sm text-gray-600">Відвідувань</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-300">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {activeTickets}
          </div>
          <div className="text-sm text-gray-600">Активні квитки</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-300">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            ₴{totalSpent}
          </div>
          <div className="text-sm text-gray-600">Витрачено</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-300">
          <div className="text-2xl font-bold text-gray-600 mb-1">
            {memberSince}
          </div>
          <div className="text-sm text-gray-600">Учасник з</div>
        </div>
      </div>
    </div>
  </section>
);
