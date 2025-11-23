import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const apiKey = process.env.COINGECKO_API_KEY;

        // Using CoinGecko's API with authentication for higher rate limits
        const url = apiKey
            ? `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`
            : 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd';

        const response = await fetch(url, {
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!response.ok) {
            throw new Error('Failed to fetch BCH price');
        }

        const data = await response.json();
        const bchPrice = data['bitcoin-cash']?.usd;

        if (!bchPrice) {
            throw new Error('BCH price not found in response');
        }

        return NextResponse.json({
            bchToUsd: bchPrice,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching BCH price:', error);

        // Fallback to a default rate if API fails
        return NextResponse.json({
            bchToUsd: 500, // Fallback rate
            timestamp: new Date().toISOString(),
            error: 'Using fallback rate'
        }, { status: 200 });
    }
}
