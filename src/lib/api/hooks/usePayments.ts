import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReleasablePayments, releasePayment, ReleasablePayment, ReleasePaymentResult } from '../services/payments';

export const useReleasablePayments = () => {
  return useQuery<ReleasablePayment[], Error>({
    queryKey: ['admin', 'payments', 'releasable'],
    queryFn: getReleasablePayments,
    staleTime: 15_000,
  });
};

export const useReleasePayment = () => {
  const queryClient = useQueryClient();
  return useMutation<ReleasePaymentResult, Error, number>({
    mutationFn: (paymentId) => releasePayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'releasable'] });
    },
  });
};
