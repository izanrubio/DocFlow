import { useQuery } from '@tanstack/react-query';
import { getUsage } from '../api/billing';
import { useAuth } from './useAuth';

export function useBillingUsage() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['billing-usage'],
        queryFn:  () => getUsage().then((r) => r.data.data),
        enabled:  !!user,
        staleTime: 60_000,
    });
}
