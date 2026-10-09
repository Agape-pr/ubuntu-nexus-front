export type AdminPermission =
  | 'manage_users'
  | 'manage_sellers'
  | 'view_orders'
  | 'manage_payments'
  | 'view_audit_log';

export interface AdminSessionUser {
  id: number;
  email: string;
  role: string;
  is_superuser: boolean;
  admin_permissions: string[];
}

export interface AccountUser {
  id: number;
  email: string;
  username: string;
  role: 'admin' | 'seller' | 'buyer';
  phone_number?: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  admin_permissions: string[];
  date_joined: string;
  last_login?: string | null;
  store?: { id: number; store_name: string; slug: string; payout_phone_number?: string | null } | null;
}

export interface PermissionInfo {
  id: string;
  label: string;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AdminOrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
  subtotal: number | string;
}

export interface AdminOrder {
  id: number;
  buyer_id: number;
  store_id: number;
  total_amount: string;
  status: string;
  payment_status: string;
  delivery_address: Record<string, string> | null;
  items: AdminOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface AdminPayment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_amount: string;
  payment_status: string;
  transaction_id: string | null;
  payment_date: string | null;
}

export interface AuditEntry {
  id: number;
  actor_id: number | null;
  actor_email: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

export interface LoginChallenge {
  otp_required: true;
  challenge: string;
  email_hint: string;
  expires_in: number;
}
