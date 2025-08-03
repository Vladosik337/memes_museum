export interface MuseumUser {
  id: number;
  first_name: string;
  last_name?: string;
  email: string;
  password_hash?: string;
  role: string;
  oidc_sub?: string;
  created_at: string;
  updated_at: string;
}

export interface MuseumTicket {
  id: number;
  user_id: number;
  purchase_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  visit_date: string;
  comment?: string;
  number: string;
  qr_code: string;
  status: "active" | "cancelled" | "used";
  is_owner: number;
  created_at: string;
}

export interface MuseumPurchase {
  id: number;
  user_id: number;
  purchase_date: string;
  total_amount: number;
  status: string;
  created_at: string;
}
