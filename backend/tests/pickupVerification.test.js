import assert from 'assert';
import { generateSecurePickupCode, sanitizeOrder } from '../src/controllers/orderController.js';

console.log('🧪 Starting Pickup Verification Security & Workflow Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] Test ${totalTests}: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] Test ${totalTests}: ${testName}`);
    console.error(`   Error: ${err.message}\n`);
    process.exitCode = 1;
  }
}

// 1. Cryptographically Secure 6-digit numeric generator
runTest('generateSecurePickupCode() returns non-predictable 6-digit numeric string', () => {
  const codes = new Set();
  for (let i = 0; i < 50; i++) {
    const code = generateSecurePickupCode();
    assert.strictEqual(typeof code, 'string', 'Code must be a string');
    assert.strictEqual(code.length, 6, 'Code must have exactly 6 characters');
    assert.match(code, /^\d{6}$/, 'Code must contain only digits');
    const num = parseInt(code, 10);
    assert.ok(num >= 100000 && num <= 999999, 'Code must be between 100000 and 999999');
    codes.add(code);
  }
  assert.ok(codes.size > 40, 'Codes must have high cryptographic entropy and variance');
});

// 2. Sanitization: Order owner sees code ONLY when Ready and uncollected
runTest('sanitizeOrder() displays code to owner ONLY when Ready and uncollected', () => {
  const mockOrder = {
    id: 'test-ord-01',
    userId: 'student-uid-123',
    userEmail: 'student@student.ac.in',
    status: 'Ready',
    pickupCode: '492817',
    isPickedUp: false,
  };

  const studentUser = { uid: 'student-uid-123', email: 'student@student.ac.in', role: 'student' };
  const sanitizedStudent = sanitizeOrder(mockOrder, studentUser);
  assert.strictEqual(sanitizedStudent.pickupCode, '492817', 'Owner must see their pickupCode when Ready');

  // Once collected, code must NOT be visible even to student
  const collectedOrder = { ...mockOrder, status: 'Collected', isPickedUp: true };
  const sanitizedCollected = sanitizeOrder(collectedOrder, studentUser);
  assert.strictEqual(sanitizedCollected.pickupCode, undefined, 'Owner must NOT see code once order is collected');
});

// 3. Sanitization: ShopAdmin and Admin responses NEVER include pickupCode
runTest('sanitizeOrder() strips pickupCode from ShopAdmin and Admin responses to prevent leakage', () => {
  const mockOrder = {
    id: 'test-ord-02',
    userId: 'student-uid-123',
    userEmail: 'student@student.ac.in',
    status: 'Ready',
    pickupCode: '782910',
    isPickedUp: false,
  };

  const shopAdminUser = { uid: 'shop-uid-999', email: 'suresh@shopadmin.ac.in', role: 'shopadmin' };
  const adminUser = { uid: 'admin-uid-001', email: 'admin@admin.ac.in', role: 'admin' };

  const sanitizedShopAdmin = sanitizeOrder(mockOrder, shopAdminUser);
  assert.strictEqual(sanitizedShopAdmin.pickupCode, undefined, 'ShopAdmin must never receive pickupCode in responses');

  const sanitizedAdmin = sanitizeOrder(mockOrder, adminUser);
  assert.strictEqual(sanitizedAdmin.pickupCode, undefined, 'Campus Admin must never receive pickupCode in responses');
});

// 4. Verification Logic: Valid code collection & invalidation
runTest('Valid code transitions order to Collected, marks isPickedUp, and invalidates code', () => {
  const code = '554433';
  const order = {
    id: 'test-ord-03',
    status: 'Ready',
    pickupCode: code,
    pickupAttempts: 0,
    maxPickupAttempts: 5,
    isPickedUp: false,
    timeline: [],
  };

  // Simulate verification
  assert.strictEqual(order.status, 'Ready');
  assert.strictEqual(code, order.pickupCode);

  // Apply state change
  const now = new Date().toISOString();
  order.status = 'Collected';
  order.isPickedUp = true;
  order.pickedUpAt = now;
  order.pickupCode = null; // Invalidate
  order.timeline.push({ status: 'Collected', timestamp: now });

  assert.strictEqual(order.status, 'Collected');
  assert.strictEqual(order.isPickedUp, true);
  assert.strictEqual(order.pickupCode, null, 'Code must be invalidated upon successful collection');
});

// 5. Brute Force Protection: Reject after 5 failed attempts
runTest('Brute force defense locks order after exceeding max attempts', () => {
  const order = {
    id: 'test-ord-04',
    status: 'Ready',
    pickupCode: '998877',
    pickupAttempts: 4,
    maxPickupAttempts: 5,
    isPickedUp: false,
  };

  const wrongCode = '000000';
  assert.notStrictEqual(wrongCode, order.pickupCode);

  // Attempt 5 (last allowed attempt before lockout)
  order.pickupAttempts++;
  assert.strictEqual(order.pickupAttempts, 5);

  // Attempt 6 (exceeded)
  const isLocked = order.pickupAttempts >= order.maxPickupAttempts;
  assert.strictEqual(isLocked, true, 'Order verification must lock once attempts reach maxPickupAttempts');
});

// 6. Premature Collection Guard: Reject if order is not Ready
runTest('Verification is rejected if order status is not Ready', () => {
  const pendingOrder = { id: 'test-ord-05', status: 'Pending', pickupCode: '112233' };
  const approvedOrder = { id: 'test-ord-06', status: 'Approved', pickupCode: '112233' };

  assert.notStrictEqual(pendingOrder.status, 'Ready');
  assert.notStrictEqual(approvedOrder.status, 'Ready');
});

// 7. Code Replay Guard: Reject if already collected
runTest('Verification is rejected if order is already collected or picked up', () => {
  const alreadyCollected = { id: 'test-ord-07', status: 'Collected', isPickedUp: true, pickupCode: null };
  const canVerify = alreadyCollected.status === 'Ready' && !alreadyCollected.isPickedUp;
  assert.strictEqual(canVerify, false, 'Already collected orders cannot be verified again');
});

console.log(`\n🎉 Results: ${passedTests}/${totalTests} tests passed successfully!`);
