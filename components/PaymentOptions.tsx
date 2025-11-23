'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, Check, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BCH_DISCOUNT_PERCENT } from '@/lib/config';
import QRCode from 'qrcode';
import Image from 'next/image';

interface PaymentOptionsProps {
    priceUsd: number;
    signupId: string;
}

export function PaymentOptions({ priceUsd, signupId }: PaymentOptionsProps) {
    const [method, setMethod] = useState<'bch' | 'fiat'>('bch');
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [paymentAddress, setPaymentAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [liveBchRate, setLiveBchRate] = useState<number | null>(null);
    const [isFetchingRate, setIsFetchingRate] = useState(true);

    // Fetch live BCH price on component mount
    useEffect(() => {
        const fetchBchPrice = async () => {
            try {
                const response = await fetch('/api/bch-price');
                const data = await response.json();
                setLiveBchRate(data.bchToUsd);
            } catch (error) {
                console.error('Error fetching BCH price:', error);
                setLiveBchRate(500); // Fallback rate
            } finally {
                setIsFetchingRate(false);
            }
        };

        fetchBchPrice();

        // Refresh price every 60 seconds
        const interval = setInterval(fetchBchPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    const bchRate = liveBchRate || 500; // Use live rate or fallback
    const priceBch = (priceUsd * (1 - BCH_DISCOUNT_PERCENT / 100)) / bchRate;
    const savings = priceUsd * (BCH_DISCOUNT_PERCENT / 100);

    const generateAddress = async () => {
        setIsLoading(true);
        try {
            // Call backend API to generate address
            const res = await fetch('/api/blockchain/generate-payment-address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ signupId, amountBch: priceBch }),
            });
            const data = await res.json();

            if (data.address) {
                setPaymentAddress(data.address);
                const url = await QRCode.toDataURL(data.address);
                setQrCodeUrl(url);

                // Start polling for payment status
                pollPaymentStatus(data.address);
            }
        } catch (error) {
            console.error('Error generating address:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const pollPaymentStatus = (address: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/blockchain/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address, signupId }),
                });
                const data = await res.json();

                if (data.confirmed) {
                    clearInterval(interval);
                    // Redirect to confirmation page
                    window.location.href = `/confirmation/${signupId}`;
                }
            } catch (error) {
                console.error('Error verifying payment:', error);
            }
        }, 5000); // Poll every 5 seconds
    };

    return (
        <div className="space-y-8">
            {/* Method Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    onClick={() => setMethod('bch')}
                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${method === 'bch'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-green-200'
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full">
                            <Wallet className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                        {method === 'bch' && <Check className="text-green-600" size={24} />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pay with Bitcoin Cash</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Instant & Secure</p>
                    <div className="inline-block bg-green-200 dark:bg-green-900/60 text-green-800 dark:text-green-200 text-xs font-bold px-2 py-1 rounded-md">
                        SAVE {BCH_DISCOUNT_PERCENT}% (${savings.toFixed(2)})
                    </div>
                </div>

                <div
                    onClick={() => setMethod('fiat')}
                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${method === 'fiat'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-purple-200'
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-full">
                            <CreditCard className="text-purple-600 dark:text-purple-400" size={24} />
                        </div>
                        {method === 'fiat' && <Check className="text-purple-600" size={24} />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pay with Card</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Credit / Debit / Apple Pay</p>
                </div>
            </div>

            {/* Payment Details */}
            <Card className="p-8 border-gray-200 dark:border-gray-800">
                {method === 'bch' ? (
                    <div className="text-center space-y-6">
                        <div className="space-y-2">
                            <p className="text-gray-500 dark:text-gray-400">Total Amount</p>
                            {isFetchingRate ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={20} />
                                    <p className="text-lg text-gray-500">Fetching live BCH rate...</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                                        {priceBch.toFixed(8)} BCH
                                    </p>
                                    <p className="text-sm text-green-600 font-medium">
                                        ~${(priceUsd - savings).toFixed(2)} USD
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Live rate: 1 BCH = ${bchRate.toFixed(2)} USD
                                    </p>
                                </>
                            )}
                        </div>

                        {!qrCodeUrl ? (
                            <Button
                                onClick={generateAddress}
                                disabled={isLoading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl"
                            >
                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Generate Payment QR'}
                            </Button>
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-gray-100">
                                    <Image src={qrCodeUrl} alt="Payment QR" width={200} height={200} />
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl flex items-center justify-between max-w-md mx-auto">
                                    <code className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-all mr-2">
                                        {paymentAddress}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigator.clipboard.writeText(paymentAddress || '')}
                                    >
                                        <Copy size={16} />
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center text-sm text-gray-500 animate-pulse">
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Waiting for payment...
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center space-y-6">
                        <p className="text-gray-500">Fiat payment integration coming soon.</p>
                        <Button disabled className="w-full py-6 text-lg rounded-xl">
                            Pay with Card (Coming Soon)
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
