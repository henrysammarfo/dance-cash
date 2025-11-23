import QRCode from 'qrcode';

export async function generateCashStampQR(studioAddress: string, amountBch: number) {
    try {
        // Use the real stamps.cash API to create a claimable stamp
        const response = await fetch('https://stamps.cash/api/v1/stamps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amountBch,
                currency: 'BCH',
                network: 'chipnet', // Use chipnet for testing
                message: `Dance.cash Cashback Reward - ${amountBch.toFixed(8)} BCH`,
            }),
        });

        if (!response.ok) {
            throw new Error(`CashStamp API error: ${response.statusText}`);
        }

        const data = await response.json();

        // The API returns a claim URL and QR code
        const claimUrl = data.claimUrl || data.url;

        // Generate QR code from claim URL
        const qrCodeUrl = await QRCode.toDataURL(claimUrl);

        return {
            id: data.id || 'cs_' + Date.now(),
            qrCodeUrl,
            claimUrl,
        };
    } catch (error) {
        console.error('Error creating CashStamp:', error);

        // Fallback: Create a simple QR code with payment info
        const fallbackData = `bitcoincash:${studioAddress}?amount=${amountBch}&message=Dance.cash%20Cashback`;
        const qrCodeUrl = await QRCode.toDataURL(fallbackData);

        return {
            id: 'cs_fallback_' + Date.now(),
            qrCodeUrl,
            claimUrl: fallbackData,
        };
    }
}

