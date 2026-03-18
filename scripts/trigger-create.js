
const orderId = '6993f4c9fe3b6a2d7013b176';
const url = 'http://localhost:3000/api/payment/create';

async function trigger() {
    try {
        console.log(`Triggering POST ${url}...`);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
        });
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response body:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Trigger failed:', error.message);
    }
}

trigger();
