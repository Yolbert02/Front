
const API_URL = 'http://localhost:4000';

async function testCreateComplaint() {
    console.log("Testing Complaint Creation...");

    // 1. Login to get token
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test_tech@gmail.com',
            password: 'password123'
        })
    });

    const loginData = await loginRes.json();
    if (!loginData.token) {
        console.error("Login failed:", loginData);
        return;
    }
    const token = loginData.token;
    console.log("Logged in successfully. User ID:", loginData.user.id);

    // 2. Fetch zones to get a valid Id_zone
    const zonesRes = await fetch(`${API_URL}/api/zones`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const zones = await zonesRes.json();
    if (!zones.length) {
        console.error("No zones found");
        return;
    }
    const zoneId = zones[0].id;
    console.log("Using zone ID:", zoneId);

    // 3. Try to create a complaint
    const complaintPayload = {
        title: "Test Complaint from Script",
        description: "This is a detailed description for a test complaint created via script.",
        incidentDate: "2026-02-05",
        complainant_name: "Test Complainant",
        complainant_phone: "123456789",
        complainant_email: "test@example.com",
        location: "Test Location, San Cristobal",
        Id_zone: zoneId
    };

    console.log("Sending payload:", JSON.stringify(complaintPayload, null, 2));

    const createRes = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(complaintPayload)
    });

    const createData = await createRes.json();
    if (createRes.ok) {
        console.log("Complaint created successfully!", createData);
    } else {
        console.error("Error creating complaint:", createRes.status, createData);
    }
}

testCreateComplaint();
