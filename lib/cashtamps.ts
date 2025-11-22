import QRCode from 'qrcode';

export async function generateCashStampQR(studioAddress: string, amountBch: number) {
    // CashStamp is essentially a claimable link or QR code
    // For MVP, we'll generate a QR code that represents the claim

    const claimData = JSON.stringify({
        type: 'cashstamp',
        studio: studioAddress,
        amount: amountBch,
        timestamp: Date.now()
    });

    const qrCodeUrl = await QRCode.toDataURL(claimData);

    return {
        id: 'cs_' + Date.now(),
        qrCodeUrl
    };
}
