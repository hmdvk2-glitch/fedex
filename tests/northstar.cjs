const path = require('path');
const fs = require('fs');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('=== STARTING NORTHSTAR MVP TEST SUITE ===\n');

  let customerToken = '';
  let adminToken = '';
  let createdTrackingNumber = '';

  // Helper for requests
  const makeRequest = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {}
      return { status: res.status, data, headers: res.headers };
    } catch (err) {
      console.error(`Request to ${url} failed:`, err.message);
      throw err;
    }
  };

  // Test 1: Register customer
  console.log('Test 1: Register customer...');
  const uniqueEmail = `test_customer_${Date.now()}@example.com`;
  const registerPayload = {
    name: 'Test Customer',
    email: uniqueEmail,
    password: 'customerpass123',
    phone: '1234567890'
  };

  const regRes = await makeRequest(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload)
  });

  if (regRes.status === 200 && regRes.data.success === true) {
    console.log('✓ Test 1 Passed: Customer registered successfully (HTTP 200).\n');
  } else {
    console.error('✗ Test 1 Failed:', regRes.status, regRes.data);
    process.exit(1);
  }

  // Test 2: Login customer
  console.log('Test 2: Login customer...');
  const loginRes = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'customerpass123'
    })
  });

  if (loginRes.status === 200 && loginRes.data.token) {
    customerToken = loginRes.data.token;
    console.log('✓ Test 2 Passed: Customer login successful. Token generated:', customerToken.substring(0, 20) + '...\n');
  } else {
    console.error('✗ Test 2 Failed:', loginRes.status, loginRes.data);
    process.exit(1);
  }

  // Get Admin token
  console.log('Logging in as Admin...');
  const adminLoginRes = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@fedex.com',
      password: 'admin123'
    })
  });
  if (adminLoginRes.status === 200 && adminLoginRes.data.token) {
    adminToken = adminLoginRes.data.token;
  } else {
    console.error('Admin login failed:', adminLoginRes.status, adminLoginRes.data);
    process.exit(1);
  }

  // Test 3: Admin creates shipment
  console.log('Test 3: Admin creates shipment...');
  const shipmentPayload = {
    customer_name: 'Test Customer',
    customer_email: uniqueEmail,
    customer_phone: '1234567890',
    pickup_address: '123 Logistics St, Memphis',
    delivery_address: '456 Delivery Rd, San Francisco'
  };

  const createRes = await makeRequest(`${BASE_URL}/api/admin/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${adminToken}`
    },
    body: JSON.stringify(shipmentPayload)
  });

  if (createRes.status === 200 && createRes.data.success === true && createRes.data.tracking_number) {
    createdTrackingNumber = createRes.data.tracking_number;
    console.log('✓ Test 3 Passed: Shipment created successfully. Tracking number:', createdTrackingNumber + '\n');
  } else {
    console.error('✗ Test 3 Failed:', createRes.status, createRes.data);
    process.exit(1);
  }

  // Test 4: Parcel exists in database (Query database using sql.js directly)
  console.log('Test 4: Verify parcel exists in SQLite database...');
  const initSqlJs = require(path.join('C:\\Users\\Administrator\\Downloads\\fedex-mvp', 'node_modules', 'sql.js', 'dist', 'sql-asm.js'));
  const dbPath = 'C:\\Users\\Administrator\\Downloads\\fedex-mvp\\fedex.db';
  const buffer = fs.readFileSync(dbPath);
  const SQL = await initSqlJs();
  const db = new SQL.Database(buffer);

  const stmt = db.prepare('SELECT * FROM parcels WHERE tracking_number = ?');
  stmt.bind([createdTrackingNumber]);
  let foundParcel = null;
  if (stmt.step()) {
    foundParcel = stmt.getAsObject();
  }
  stmt.free();

  if (foundParcel && foundParcel.tracking_number === createdTrackingNumber) {
    console.log('✓ Test 4 Passed: Parcel exists in database. DB Status:', foundParcel.status + '\n');
  } else {
    console.error('✗ Test 4 Failed: Parcel not found in SQLite database file.');
    process.exit(1);
  }

  // Test 5: Customer dashboard loads parcel
  console.log('Test 5: Verify customer dashboard loads parcel via API...');
  const customerParcelsRes = await makeRequest(`${BASE_URL}/api/parcels`, {
    method: 'GET',
    headers: {
      'Cookie': `token=${customerToken}`
    }
  });

  if (customerParcelsRes.status === 200 && customerParcelsRes.data.success === true) {
    const list = customerParcelsRes.data.data;
    const match = list.find(p => p.tracking_number === createdTrackingNumber);
    if (match) {
      console.log('✓ Test 5 Passed: Parcel is visible on customer dashboard API.\n');
    } else {
      console.error('✗ Test 5 Failed: Parcel was not listed under customer account.', list);
      process.exit(1);
    }
  } else {
    console.error('✗ Test 5 Failed:', customerParcelsRes.status, customerParcelsRes.data);
    process.exit(1);
  }

  // Test 6: Public tracking page lookup
  console.log('Test 6: Verify public tracking endpoint...');
  const trackingLookupRes = await makeRequest(`${BASE_URL}/api/track/${createdTrackingNumber}`);

  if (trackingLookupRes.status === 200 && trackingLookupRes.data.parcel) {
    console.log('✓ Test 6 Passed: Public tracking details returned successfully. Status:', trackingLookupRes.data.parcel.status + '\n');
  } else {
    console.error('✗ Test 6 Failed:', trackingLookupRes.status, trackingLookupRes.data);
    process.exit(1);
  }

  // Test 7: Tracking history returned
  console.log('Test 7: Verify tracking history status contains BOOKED...');
  if (trackingLookupRes.data.history && trackingLookupRes.data.history.length > 0) {
    const bookedEvent = trackingLookupRes.data.history.find(event => event.status === 'BOOKED');
    if (bookedEvent) {
      console.log('✓ Test 7 Passed: Tracking history returned and contains BOOKED status event.\n');
    } else {
      console.error('✗ Test 7 Failed: BOOKED status event missing in history list.', trackingLookupRes.data.history);
      process.exit(1);
    }
  } else {
    console.error('✗ Test 7 Failed: No tracking history returned.', trackingLookupRes.data.history);
    process.exit(1);
  }

  console.log('============================================');
  console.log('🎉 ALL 7 NORTHSTAR MVP TESTS PASSED SUCCESSFULLY!');
  console.log('============================================');
}

runTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
