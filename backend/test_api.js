async function test() {
    try {
        const loginRes = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test_tech@gmail.com',
                password: 'test1234'
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;

        const statsRes = await fetch('http://localhost:4000/api/stats/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const statsData = await statsRes.json();
        console.log('Stats status:', statsRes.status);
        console.log('Stats Data:', JSON.stringify(statsData, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();
