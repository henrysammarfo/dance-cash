export const BCH_NETWORKS = {
    chipnet: {
        name: 'chipnet',
        prefix: 'bchtest:',
        faucet: 'https://tbch.googol.cash/',
        explorer: 'https://chipnet.imaginary.cash/',
        network: 'chipnet',
        isTestnet: true
    },
    mainnet: {
        name: 'mainnet',
        prefix: 'bitcoincash:',
        explorer: 'https://explorer.bitcoincash.org',
        network: 'mainnet',
        isTestnet: false
    }
};

export const ACTIVE_NETWORK = (process.env.NEXT_PUBLIC_BCH_NETWORK as keyof typeof BCH_NETWORKS) || 'chipnet';
export const BCH_CONFIG = BCH_NETWORKS[ACTIVE_NETWORK];

export const APP_NAME = 'Dance.cash';
export const CURRENCY_USD = 'USD';
export const CURRENCY_BCH = 'BCH';
export const BCH_DISCOUNT_PERCENT = 10;
export const BCH_TO_USD_RATE = 750; // 1 BCH = $750 (This should be dynamic in production)
