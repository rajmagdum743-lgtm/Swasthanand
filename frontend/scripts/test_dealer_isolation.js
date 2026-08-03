const http = require('http');

const API_BASE = 'http://localhost:8081';

function post(url, data, token = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch {
          resolve({ status: res.statusCode, body: resBody });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(url, token = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch {
          resolve({ status: res.statusCode, body: resBody });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function put(url, data = {}, token = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch {
          resolve({ status: res.statusCode, body: resBody });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runTest() {
  console.log("===========================================================");
  console.log("🛡️ STARTING DEALER DATA ISOLATION VERIFICATION TEST");
  console.log("===========================================================");

  const timestamp = Date.now();
  const d2Phone = "9" + String(timestamp).slice(-9);

  // 1. Register Dealer 2
  console.log(`\n1️⃣ Registering New Dealer 2 (${d2Phone})...`);
  const regRes = await post(`${API_BASE}/api/auth/register`, {
    name: `New Dealer ${timestamp}`,
    phone: d2Phone,
    password: "dealer123",
    role: "DEALER"
  });
  if (regRes.status !== 200 && regRes.status !== 201) {
    throw new Error(`Dealer 2 registration failed: ${JSON.stringify(regRes.data)}`);
  }
  const d2UserId = regRes.data.user.id;
  console.log(`   ✅ Dealer 2 Registered! User ID: ${d2UserId}`);

  // 2. Login Admin & Approve Dealer 2
  console.log(`\n2️⃣ Approving Dealer 2 via Admin Console...`);
  const adminLogin = await post(`${API_BASE}/api/auth/login`, { phone: "9999999999", password: "admin123" });
  const adminToken = adminLogin.data.token;
  await put(`${API_BASE}/api/admin/dealers/${d2UserId}/approve`, {}, adminToken);
  console.log(`   ✅ Dealer 2 Approved!`);

  // 3. Login as Dealer 2
  console.log(`\n3️⃣ Logging in as Dealer 2...`);
  const d2Login = await post(`${API_BASE}/api/auth/login`, { phone: d2Phone, password: "dealer123" });
  const d2Token = d2Login.data.token;
  console.log(`   ✅ Dealer 2 Authenticated!`);

  // 4. Verify Clean Slate for Dealer 2
  console.log(`\n4️⃣ Verifying Clean Slate for Dealer 2...`);
  const d2Inv = await get(`${API_BASE}/api/dealer/inventory`, d2Token);
  const d2Certs = await get(`${API_BASE}/api/dealer/certifications`, d2Token);
  const d2Orders = await get(`${API_BASE}/api/dealer/orders`, d2Token);

  console.log(`   📦 Dealer 2 Inventory Items Count: ${d2Inv.data.length}`);
  console.log(`   📜 Dealer 2 Certifications Count: ${d2Certs.data.length}`);
  console.log(`   🚚 Dealer 2 Orders Count: ${d2Orders.data.length}`);

  if (d2Inv.data.length !== 0 || d2Certs.data.length !== 0 || d2Orders.data.length !== 0) {
    throw new Error(`❌ Isolation Failure: New Dealer 2 has non-zero initial data!`);
  }
  console.log(`   ✅ CLEAN SLATE VERIFIED! Dealer 2 starts with 0 products, 0 certs, 0 orders.`);

  // 5. Dealer 2 Creates Product
  console.log(`\n5️⃣ Dealer 2 Adding New Product ("Dealer 2 Isolated Herb")...`);
  const newProdRes = await post(`${API_BASE}/api/products`, {
    name: `Dealer 2 Isolated Herb ${timestamp}`,
    price: 499.00,
    category: "Herbs",
    sku: `D2-HERB-${timestamp}`,
    stock: 75
  }, d2Token);
  const d2ProdId = newProdRes.data.id;
  console.log(`   ✅ Product Created by Dealer 2! Product ID: ${d2ProdId}`);

  // 6. Verify Product in Dealer 2's Catalog
  const d2InvUpdated = await get(`${API_BASE}/api/dealer/inventory`, d2Token);
  console.log(`   📦 Dealer 2 Updated Inventory Count: ${d2InvUpdated.data.length}`);
  if (d2InvUpdated.data.length !== 1) {
    throw new Error(`❌ Dealer 2 should have exactly 1 product, found: ${d2InvUpdated.data.length}`);
  }

  // 7. Login as Dealer 1 and verify Isolation
  console.log(`\n6️⃣ Logging in as Original Seed Dealer 1 (9284939947)...`);
  const d1Login = await post(`${API_BASE}/api/auth/login`, { phone: "9284939947", password: "admin123" });
  const d1Token = d1Login.data.token;

  const d1Inv = await get(`${API_BASE}/api/dealer/inventory`, d1Token);
  console.log(`   📦 Dealer 1 Inventory Count: ${d1Inv.data.length}`);

  const leakedProduct = d1Inv.data.find(p => p.id === d2ProdId);
  if (leakedProduct) {
    throw new Error(`❌ DATA LEAK DETECTED! Dealer 2's product appeared in Dealer 1's inventory!`);
  }
  console.log(`   🔒 ISOLATION VERIFIED! Dealer 2's product is NOT visible to Dealer 1.`);

  console.log("\n===========================================================");
  console.log("🎉 ALL DEALER DATA ISOLATION CHECKS PASSED 100%!");
  console.log("===========================================================");
}

runTest().catch(err => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
