// import fetch from 'node-fetch'; // Built-in in Node 22

async function verifyPayment() {
    const signupId = '898c8a34-0e2b-4dd2-85cd-736e3246f67a';
    const address = 'bchtest:qzs5hj5kkj7dgapa2z7wyl8cpdt66h889smhh6mrzu';

    console.log('Verifying payment...');
    console.log('Signup ID:', signupId);
    console.log('Address:', address);

    try {
        const response = await fetch('http://localhost:3000/api/blockchain/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address,
                signupId,
            }),
        });

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

verifyPayment();
