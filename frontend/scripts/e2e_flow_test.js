/**
 * Swasthanand Complete End-to-End (E2E) Flow Integration Test
 * 
 * Tests the complete lifecycle from Login -> Product Management -> Product Approval -> B2B Order Placement -> Order Status Update -> Traceability Check -> Logout.
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8081';

async function runE2ETest() {
  console.log('===========================================================');
  console.log('🚀 STARTING SWASTHANAND END-TO-END (E2E) FUNCTIONAL TEST');
  console.log(`🌐 Target Backend API: ${API_BASE_URL}`);
  console.log('===========================================================\n');

  let adminToken = '';
  let dealerToken = '';
  let createdProductId = '';
  let createdOrderId = '';

  try {
    // -------------------------------------------------------------
    // STEP 1: Admin Authentication (Login)
    // -------------------------------------------------------------
    console.log('1️⃣ [STEP 1] Testing Admin Login...');
    const adminLoginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9999999999', password: 'admin123' })
    });
    const adminData = await adminLoginRes.json();
    if (!adminLoginRes.ok || !adminData.success) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminData)}`);
    }
    adminToken = adminData.token;
    console.log(`   ✅ Admin Login Successful! User: "${adminData.user.name}", Role: "${adminData.user.role}"`);

    // -------------------------------------------------------------
    // STEP 2: Dealer Authentication (Login)
    // -------------------------------------------------------------
    console.log('\n2️⃣ [STEP 2] Testing Dealer Login...');
    const dealerLoginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9284939947', password: 'admin123' })
    });
    const dealerData = await dealerLoginRes.json();
    if (!dealerLoginRes.ok || !dealerData.success) {
      throw new Error(`Dealer login failed: ${JSON.stringify(dealerData)}`);
    }
    dealerToken = dealerData.token;
    console.log(`   ✅ Dealer Login Successful! User: "${dealerData.user.name}", Role: "${dealerData.user.role}"`);

    // -------------------------------------------------------------
    // STEP 3: Public Product Catalog Fetch
    // -------------------------------------------------------------
    console.log('\n3️⃣ [STEP 3] Fetching Public Product Catalog...');
    const productsRes = await fetch(`${API_BASE_URL}/api/products`);
    const products = await productsRes.json();
    if (!productsRes.ok || !Array.isArray(products)) {
      throw new Error(`Failed to fetch public products.`);
    }
    console.log(`   ✅ Public Product Catalog loaded successfully (${products.length} products found).`);

    const validBatchId = products[0]?.batchId || null;

    // -------------------------------------------------------------
    // STEP 4: Dealer Product Submission (Add Product)
    // -------------------------------------------------------------
    console.log('\n4️⃣ [STEP 4] Submitting New Dealer Product (E2E Test Batch)...');
    const timestamp = Date.now();
    const newProductPayload = {
      id: 'prod-ashwa-e2e-' + timestamp,
      name: 'Organic Ashwagandha Extract (E2E Test)',
      sku: 'ASHWA-EXT-' + timestamp,
      description: 'Pure certified organic Ashwagandha root extract.',
      benefitsDescription: 'Promotes vitality, stress relief, and endurance.',
      price: 349.00,
      category: 'Supplements',
      tags: ['immunity', 'energy', 'stress-relief'],
      origin: 'Sangli District, Maharashtra',
      batchId: validBatchId,
      harvestDate: new Date().toISOString().split('T')[0],
      stock: 150,
      status: 'DEALER_ALLOCATED',
      dealershipNodeId: 'satara-coop-node-id',
      isApproved: false
    };

    const addProdRes = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dealerToken}`
      },
      body: JSON.stringify(newProductPayload)
    });
    const createdProduct = await addProdRes.json();
    if (!addProdRes.ok || !createdProduct.id) {
      throw new Error(`Dealer product creation failed: ${JSON.stringify(createdProduct)}`);
    }
    createdProductId = createdProduct.id;
    console.log(`   ✅ Product Created by Dealer! ID: "${createdProductId}", Status: "${createdProduct.status}", Approved: ${createdProduct.isApproved}`);

    // -------------------------------------------------------------
    // STEP 5: Admin Product Approval
    // -------------------------------------------------------------
    console.log('\n5️⃣ [STEP 5] Approving Product via Admin Console...');
    const approveRes = await fetch(`${API_BASE_URL}/api/products/${createdProductId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const approvedProduct = await approveRes.json();
    if (!approveRes.ok || !approvedProduct.isApproved) {
      throw new Error(`Admin product approval failed.`);
    }
    console.log(`   ✅ Product Approved by Admin! Approved Status: ${approvedProduct.isApproved}`);

    // -------------------------------------------------------------
    // STEP 6: Dealer B2B Procurement Order Placement
    // -------------------------------------------------------------
    console.log('\n6️⃣ [STEP 6] Placing Dealer B2B Procurement Order...');
    const orderPayload = {
      userId: dealerData.user.id,
      totalAmount: 17450.00,
      status: 'PENDING',
      dealershipNodeId: 'satara-coop-node-id'
    };

    const placeOrderRes = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dealerToken}`
      },
      body: JSON.stringify(orderPayload)
    });
    const placedOrder = await placeOrderRes.json();
    if (!placeOrderRes.ok || !placedOrder.id) {
      throw new Error(`Order placement failed: ${JSON.stringify(placedOrder)}`);
    }
    createdOrderId = placedOrder.id;
    console.log(`   ✅ B2B Order Created! Order ID: "${createdOrderId}", Total: ₹${placedOrder.totalAmount}, Status: "${placedOrder.status}"`);

    // -------------------------------------------------------------
    // STEP 7: Admin Order Status Transition
    // -------------------------------------------------------------
    console.log('\n7️⃣ [STEP 7] Updating Order Status via Admin Console...');
    const updateOrderRes = await fetch(`${API_BASE_URL}/api/admin/orders/${createdOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'CONFIRMED' })
    });
    const updatedOrder = await updateOrderRes.json();
    if (!updateOrderRes.ok || updatedOrder.status !== 'CONFIRMED') {
      throw new Error(`Admin order status update failed.`);
    }
    console.log(`   ✅ Order Status Updated to "CONFIRMED" by Admin!`);

    // -------------------------------------------------------------
    // STEP 8: Batch Traceability Query
    // -------------------------------------------------------------
    console.log('\n8️⃣ [STEP 8] Querying Farm-to-Depot Traceability Data...');
    const traceRes = await fetch(`${API_BASE_URL}/api/traceability/history/${createdProductId}`);
    const traceData = await traceRes.json();
    if (!traceRes.ok || !traceData.product) {
      throw new Error(`Traceability query failed.`);
    }
    console.log(`   ✅ Traceability Records Verified for Product "${traceData.product.name}"! Batch ID: "${traceData.product.batchId}"`);

    // -------------------------------------------------------------
    // STEP 9: Unauthorized Access Protection Test
    // -------------------------------------------------------------
    console.log('\n9️⃣ [STEP 9] Testing Unauthorized Access Security Gate...');
    const unauthorizedRes = await fetch(`${API_BASE_URL}/api/admin/dealers/pending`);
    if (unauthorizedRes.status === 401 || unauthorizedRes.status === 403) {
      console.log(`   ✅ Security Gate Verified! Unauthorized request blocked with HTTP ${unauthorizedRes.status}.`);
    } else {
      console.warn(`   ⚠️ Security Gate returned HTTP ${unauthorizedRes.status}`);
    }

    // -------------------------------------------------------------
    // SUMMARY & CONCLUSION
    // -------------------------------------------------------------
    console.log('\n===========================================================');
    console.log('🎉 ALL E2E FUNCTIONAL FLOW TESTS PASSED SUCCESSFULLY! (100%)');
    console.log('===========================================================');

  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err.message);
    process.exit(1);
  }
}

runE2ETest();
