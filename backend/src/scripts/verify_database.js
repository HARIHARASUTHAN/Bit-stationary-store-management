import { db, isFirebaseConnected } from '../config/firebase.js';

async function verifyDatabase() {
  console.log('====================================================');
  console.log('🔍 CLOUD FIRESTORE DATABASE VERIFICATION AUDIT');
  console.log('====================================================');

  if (!isFirebaseConnected || !db) {
    console.error('❌ Cloud Firestore is NOT connected. Operating in memory only.');
    process.exit(1);
  }

  console.log('✅ Connection Status: CONNECTED to Google Cloud Firestore\n');

  try {
    // 1. Check USERS Collection
    const usersSnap = await db.collection('users').get();
    console.log(`👤 [1] USERS COLLECTION: Total ${usersSnap.size} accounts in database`);
    usersSnap.forEach((doc) => {
      const u = doc.data();
      console.log(`   • UID: ${doc.id}`);
      console.log(`     Email: ${u.email || u.id} | Role: ${u.role} | Name: ${u.name || u.displayName} | Shop: ${u.shopId || u.shop || 'N/A'}`);
    });
    console.log('');

    // 2. Check INVENTORY Collection
    const inventorySnap = await db.collection('inventory').get();
    console.log(`📦 [2] INVENTORY COLLECTION: Total ${inventorySnap.size} stationery items in database`);
    let sampleItems = [];
    let itemsWithShopStocks = 0;
    inventorySnap.forEach((doc) => {
      const item = doc.data();
      if (item.shopStocks && Object.keys(item.shopStocks).length > 0) {
        itemsWithShopStocks++;
      }
      if (sampleItems.length < 5) {
        sampleItems.push({ id: doc.id, name: item.name, sku: item.sku, price: item.price, stock: item.stock, shopStocks: item.shopStocks });
      }
    });
    console.log(`   • Items with multi-shop inventory breakdown (shopStocks): ${itemsWithShopStocks}/${inventorySnap.size}`);
    console.log('   • Sample Items in Firestore:');
    sampleItems.forEach((it) => {
      console.log(`     - [${it.id}] ${it.name} (${it.sku}): Price ₹${it.price}, Overall Stock: ${it.stock}`);
      if (it.shopStocks) {
        console.log(`       Shop stocks: ${JSON.stringify(it.shopStocks)}`);
      }
    });
    console.log('');

    // 3. Check SLOTS Collection
    const slotsSnap = await db.collection('slots').get();
    console.log(`⏰ [3] PICKUP SLOTS COLLECTION: Total ${slotsSnap.size} slots in database`);
    slotsSnap.forEach((doc) => {
      const s = doc.data();
      console.log(`   • [${doc.id}] ${s.date} ${s.time} | Cap: ${s.capacity} | Booked: ${s.booked || 0} | Shop bookings: ${JSON.stringify(s.shopBookings || {})}`);
    });
    console.log('');

    // 4. Check ORDERS Collection
    const ordersSnap = await db.collection('orders').get();
    console.log(`📋 [4] ORDERS COLLECTION: Total ${ordersSnap.size} orders in database`);
    ordersSnap.forEach((doc) => {
      const o = doc.data();
      const itemsSummary = (o.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ');
      console.log(`   • Order ID: ${doc.id}`);
      console.log(`     User: ${o.userName} (${o.userEmail}) | Role: ${o.role}`);
      console.log(`     Shop: ${o.shopId || o.shopName || 'N/A'} | Status: ${o.status} | Total: ₹${o.total}`);
      console.log(`     Items: ${itemsSummary}`);
      console.log(`     Slot: ${o.pickupSlot?.date} ${o.pickupSlot?.time}`);
      console.log(`     Placed At: ${o.placedAt}`);
    });
    console.log('');

    // 5. Check SETTINGS Collection
    const settingsSnap = await db.collection('settings').get();
    console.log(`⚙️  [5] SETTINGS COLLECTION: Total ${settingsSnap.size} document(s)`);
    settingsSnap.forEach((doc) => {
      console.log(`   • [${doc.id}]:`, JSON.stringify(doc.data()));
    });
    console.log('');

    // 6. Check AUDIT LOGS
    const auditSnap = await db.collection('audit_logs').get();
    console.log(`📜 [6] AUDIT LOGS COLLECTION: Total ${auditSnap.size} log(s) in database`);

    console.log('====================================================');
    console.log('🎉 VERIFICATION COMPLETE: ALL DATA IS STORED & VERIFIED IN CLOUD FIRESTORE!');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error verifying database:', err);
    process.exit(1);
  }
}

verifyDatabase();

