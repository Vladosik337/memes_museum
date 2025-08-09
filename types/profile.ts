// Типи для профілю користувача та квитків

export type Ticket = {
  id: number;
  number: string;
  firstName: string;
  lastName: string;
  status: "active" | "expired" | "completed";
  visitDate: string;
  qrSvgId?: string;
};

export type Purchase = {
  id: number;
  date: string;
  total: number;
  status: "active" | "expired" | "completed";
  tickets: Ticket[];
};
