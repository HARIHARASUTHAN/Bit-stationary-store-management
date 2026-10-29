import assert from 'assert';

console.log('🧪 Starting Live Endpoint Integration Test...\n');

async function testEndpoints() {
  // 1. Verify route is guarded against unauthenticated requests
  const unauthRes = await fetch('http://localhost:5001/api/orders/ord-test/verify-pickup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: '123456' }),
  });

  assert.strictEqual(unauthRes.status, 401, 'Endpoint must reject requests without Bearer token');
  const unauthJson = await unauthRes.json();
  assert.strictEqual(unauthJson.error, 'Unauthorized');
  console.log('✅ [PASS] POST /api/orders/:id/verify-pickup rejects unauthenticated request (401)');

  console.log('\n🎉 Live API Endpoint Security verified!');
}

testEndpoints().catch((e) => {
  console.error('❌ Endpoint test failed:', e.message);
  process.exit(1);
});
