import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: string;
}

export interface Order {
  id: number;
  buyer: number;
  store: number;
  total_amount: string;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface CheckoutRequest {
  items: {
    product_id: number;
    quantity: number;
  }[];
}

export const checkout = async (data: CheckoutRequest): Promise<Order[]> => {
  return apiClient.post<Order[]>(API_ENDPOINTS.ORDERS.CHECKOUT, data);
};

export const getBuyerOrders = async (): Promise<Order[]> => {
  return apiClient.get<Order[]>(API_ENDPOINTS.ORDERS.BUYER_LIST);
};

export const getSellerOrders = async (): Promise<Order[]> => {
  return apiClient.get<Order[]>(API_ENDPOINTS.ORDERS.SELLER_LIST);
};

export const updateOrderStatus = async (id: number | string, status: string): Promise<{status: string}> => {
  return apiClient.post<{status: string}>(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status });
};

export const confirmOrderReceipt = async (id: number | string): Promise<{status: string}> => {
  return apiClient.post<{status: string}>(API_ENDPOINTS.ORDERS.CONFIRM_RECEIPT(id));
};
