import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface ReleasablePayment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_amount: string;
  payment_status: string;
  transaction_id: string | null;
  payment_date: string | null;
}

export interface ReleasePaymentResult {
  status: string;
  transactionid?: string;
  referenceno?: string;
}

export const getReleasablePayments = async (): Promise<ReleasablePayment[]> => {
  const res = await apiClient.get<any>(API_ENDPOINTS.PAYMENTS.RELEASABLE);
  return Array.isArray(res) ? res : (res.results || []);
};

export const releasePayment = async (paymentId: number): Promise<ReleasePaymentResult> => {
  return apiClient.post<ReleasePaymentResult>(API_ENDPOINTS.PAYMENTS.RELEASE, { payment_id: paymentId });
};
