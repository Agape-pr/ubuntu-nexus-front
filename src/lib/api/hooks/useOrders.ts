import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as ordersService from '../services/orders';

export const useBuyerOrders = () => {
  return useQuery({
    queryKey: ['orders', 'buyer'],
    queryFn: () => ordersService.getBuyerOrders(),
  });
};

export const useSellerOrders = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['orders', 'seller'],
    queryFn: () => ordersService.getSellerOrders(),
    enabled,
    refetchInterval: enabled ? 15_000 : false, // poll every 15s for near real-time notifications
    staleTime: 10_000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: string }) => 
      ordersService.updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['orders', 'seller'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });
};

export const useConfirmReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => ordersService.confirmOrderReceipt(id),
    onSuccess: () => {
      toast.success('Order confirmed successfully');
      queryClient.invalidateQueries({ queryKey: ['orders', 'buyer'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to confirm order');
    },
  });
};
