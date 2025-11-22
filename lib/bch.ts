import { BCH_CONFIG } from './config';
// We import mainnet-js dynamically in components/functions that need it to avoid SSR issues
// or we can use it here if we ensure it runs on client/server appropriately.
// For now, we'll define helper interfaces and basic logic.

export interface PaymentRequest {
    address: string;
    amountBch: number;
    amountUsd: number;
}

export const getExplorerLink = (txId: string) => {
    return `${BCH_CONFIG.explorer}tx/${txId}`;
};

export const formatBchAmount = (amount: number) => {
    return `${amount.toFixed(8)} BCH`;
};
