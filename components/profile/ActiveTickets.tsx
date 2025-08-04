import React from "react";

type Ticket = {
  id: number;
  number: string;
  visitDate: string;
  firstName: string;
  lastName: string;
  status: string;
};

type ActiveTicketsProps = {
  tickets: Ticket[];
};

export const ActiveTickets: React.FC<ActiveTicketsProps> = ({ tickets }) => (
  <div className="dashboard-card rounded-xl shadow-lg p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
      Поточні квитки
      <span className="ml-2 bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
        {tickets.length}
      </span>
    </h2>
    {tickets.length === 0 ? (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Немає активних квитків
        </h3>
        <p className="text-gray-500 mb-4">
          Придбайте квиток, щоб відвідати наш музей
        </p>
        <a
          href="/ticket-purchase-page"
          className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          Придбати квиток
        </a>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-start"
          >
            <div className="font-bold text-lg mb-1">
              {ticket.firstName} {ticket.lastName}
            </div>
            <div className="text-sm text-gray-600 mb-1">#{ticket.number}</div>
            <div className="text-sm text-gray-600 mb-1">
              Дата: {ticket.visitDate}
            </div>
            <span className="inline-block px-2 py-1 mt-1 text-xs bg-green-100 text-green-800 rounded-full">
              Активний
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);
