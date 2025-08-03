// Тип квитка для API
export interface MuseumTicket {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  visit_date: string;
  comment?: string;
  number: string;
  qr_code: string;
  status: string;
  is_owner: number; // 0 або 1
  created_at: string;
}

// Тип покупки
export interface MuseumPurchase {
  id: number;
  user_id: number;
  purchase_date: string;
  total_amount: number;
  status: string;
  created_at: string;
}
