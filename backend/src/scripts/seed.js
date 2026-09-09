import { db, isFirebaseConnected } from '../config/firebase.js';

const initialItems = [
  { id: 'i1', name: 'Classmate Spiral Notebook', category: 'Notebooks & Paper', price: 65, stock: 120, lowStockThreshold: 20, description: '200 pages, A4 size, single line ruled. Spiral bound for smooth page turning. Ideal for engineering lecture notes.', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', sku: 'NB-001' },
  { id: 'i2', name: 'Reynolds Pen (Blue)', category: 'Writing Instruments', price: 12, stock: 350, lowStockThreshold: 50, description: 'Smooth-writing ballpoint pen, blue ink. Comfortable grip for exams and daily note-taking. Pack of 1.', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&auto=format&fit=crop&q=80', sku: 'WI-001' },
  { id: 'i3', name: 'Reynolds Pen (Black)', category: 'Writing Instruments', price: 12, stock: 280, lowStockThreshold: 50, description: 'Smooth-writing ballpoint pen, black ink. Dark waterproof ink ideal for official records and diagrams.', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80', sku: 'WI-002' },
  { id: 'i4', name: 'Apsara Pencil (HB)', category: 'Writing Instruments', price: 8, stock: 500, lowStockThreshold: 100, description: 'HB grade graphite pencil for technical drawing, engineering graphics, and general campus use.', image: 'https://images.unsplash.com/photo-1595584354232-f07d525d87c1?w=600&auto=format&fit=crop&q=80', sku: 'WI-003' },
  { id: 'i5', name: 'Staedtler Eraser', category: 'Writing Instruments', price: 15, stock: 200, lowStockThreshold: 40, description: 'Dust-free white vinyl eraser. Clean erasure without smudging or tearing sheet fibers.', image: 'https://images.unsplash.com/photo-1667532447990-51c6704ef358?w=600&auto=format&fit=crop&q=80', sku: 'WI-004' },
  { id: 'i6', name: 'Camlin Geometry Box', category: 'Geometry & Drafting', price: 85, stock: 75, lowStockThreshold: 15, description: 'Precision 9-piece engineering math instrument set with self-centering compass, divider, set squares, and protractor.', image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80', sku: 'GD-001' },
  { id: 'i7', name: 'Nataraj Scale 30cm', category: 'Geometry & Drafting', price: 18, stock: 180, lowStockThreshold: 30, description: '30 cm clear transparent ruler with metric and inch markings. Shatterproof acrylic body.', image: 'https://images.unsplash.com/photo-1550985543-49bee3167284?w=600&auto=format&fit=crop&q=80', sku: 'GD-002' },
  { id: 'i8', name: 'A4 Graph Paper Pad', category: 'Notebooks & Paper', price: 45, stock: 60, lowStockThreshold: 15, description: '1mm grid millimeter graph paper, 50 tear-off sheets. Standard for physics, electronics, and engineering calculations.', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', sku: 'NB-002' },
  { id: 'i9', name: 'Classmate Drawing Book', category: 'Art Supplies', price: 55, stock: 90, lowStockThreshold: 20, description: 'A3 size cartridge paper drawing pad, 24 sheets. Premium heavyweight paper for architectural and design sketches.', image: 'https://images.unsplash.com/photo-1525278070609-779c7adb7b71?w=600&auto=format&fit=crop&q=80', sku: 'AR-001' },
  { id: 'i10', name: 'Camlin Acrylic Colors Set', category: 'Art Supplies', price: 180, stock: 40, lowStockThreshold: 10, description: '6-tube artist acrylic color set, 20ml tubes. Rich vibrant pigments, fast-drying, water-soluble.', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&auto=format&fit=crop&q=80', sku: 'AR-002' },
  { id: 'i11', name: 'Scientific Calculator (FX-991)', category: 'Office Supplies', price: 850, stock: 25, lowStockThreshold: 5, description: 'Casio FX-991EX ClassWiz scientific calculator. 552 mathematical functions, matrix, equation solver, high-res display.', image: 'https://images.unsplash.com/photo-1648201637025-1c77b9be3013?w=600&auto=format&fit=crop&q=80', sku: 'OS-001' },
  { id: 'i12', name: 'Stapler (Mini)', category: 'Office Supplies', price: 95, stock: 50, lowStockThreshold: 10, description: 'Compact steel desk stapler. Jam-free mechanism, uses standard No. 10 / 24/6 staples.', image: 'https://images.unsplash.com/photo-1559743341-7fef133c7c6a?w=600&auto=format&fit=crop&q=80', sku: 'OS-002' },
  { id: 'i13', name: 'Staples Box (1000 pcs)', category: 'Office Supplies', price: 30, stock: 150, lowStockThreshold: 30, description: 'Standard 24/6 galvanized steel staples. 1000 pins per box for assignment bindings.', image: 'https://images.unsplash.com/photo-1559743341-7fef133c7c6a?w=600&auto=format&fit=crop&q=80', sku: 'OS-003' },
  { id: 'i14', name: 'Fevicol (50g)', category: 'Adhesives & Tapes', price: 25, stock: 130, lowStockThreshold: 25, description: 'Synthetic resin white adhesive. Squeeze bottle applicator. Ideal for paper crafts, projects, and mounts.', image: 'https://images.unsplash.com/photo-1536786724684-63545518d243?w=600&auto=format&fit=crop&q=80', sku: 'AT-001' },
  { id: 'i15', name: 'Scotch Tape (18mm)', category: 'Adhesives & Tapes', price: 35, stock: 100, lowStockThreshold: 20, description: 'Clear adhesive transparent tape roll with dispenser. 18mm x 25m length for document mending.', image: 'https://images.unsplash.com/photo-1665750373596-f5008ce81951?w=600&auto=format&fit=crop&q=80', sku: 'AT-002' },
  { id: 'i16', name: 'L-Shaped Folder (A4)', category: 'Files & Folders', price: 12, stock: 300, lowStockThreshold: 50, description: 'Transparent polypropylene L-folder for document protection, resume submissions, and assignment sheets.', image: 'https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=600&auto=format&fit=crop&q=80', sku: 'FF-001' },
  { id: 'i17', name: 'Ring Binder (A4, 2-Ring)', category: 'Files & Folders', price: 55, stock: 80, lowStockThreshold: 15, description: 'Durable 2D-ring file binder. Holds up to 180 punched sheets securely with spine label.', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop&q=80', sku: 'FF-002' },
  { id: 'i18', name: 'Lab Record Book', category: 'Lab Supplies', price: 80, stock: 8, lowStockThreshold: 15, description: 'A4 hardbound record notebook, 100 pages (alternate ruled/plain). Official BIT laboratory manual standard.', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80', sku: 'LS-001' },
  { id: 'i19', name: 'Graph Record Book', category: 'Lab Supplies', price: 70, stock: 45, lowStockThreshold: 15, description: 'A4 laboratory record notebook with 1mm graph sheets facing ruled pages. For practical records.', image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80', sku: 'LS-002' },
  { id: 'i20', name: 'Whiteboard Marker Set', category: 'Writing Instruments', price: 120, stock: 30, lowStockThreshold: 8, description: 'Set of 4 dry-erase whiteboard markers (Black, Blue, Red, Green). Bullet tip, low-odor alcohol ink.', image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80', sku: 'WI-005' },
  { id: 'i21', name: 'Highlighter Set (5 colors)', category: 'Writing Instruments', price: 75, stock: 110, lowStockThreshold: 25, description: '5 fluorescent pastel chisel-tip markers. Non-toxic, smear-proof ink for study notes and textbooks.', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', sku: 'WI-006' },
  { id: 'i22', name: 'Index Tabs (Sticky)', category: 'Office Supplies', price: 40, stock: 160, lowStockThreshold: 30, description: 'Self-adhesive repositionable index flags in 5 neon colors. 200 flags per dispenser.', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80', sku: 'OS-004' },
  { id: 'i23', name: 'Post-it Notes (3x3)', category: 'Office Supplies', price: 55, stock: 85, lowStockThreshold: 20, description: 'Yellow sticky memo note pads (100 sheets per pad). Sticks securely, removes cleanly.', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80', sku: 'OS-005' },
  { id: 'i24', name: 'Drafting Board Clips', category: 'Geometry & Drafting', price: 22, stock: 95, lowStockThreshold: 20, description: 'Set of 4 stainless steel drafting board clamps. Non-slip grip for engineering sheets.', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80', sku: 'GD-003' },
  { id: 'i25', name: 'Technical Pen Set', category: 'Geometry & Drafting', price: 220, stock: 18, lowStockThreshold: 5, description: '3 fine-line drafting technical ink pens (0.2mm, 0.4mm, 0.8mm) with waterproof pigment ink.', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80', sku: 'GD-004' },
  { id: 'i26', name: 'A4 White Paper Ream', category: 'Notebooks & Paper', price: 280, stock: 50, lowStockThreshold: 10, description: '500 sheets 75 GSM multipurpose white copier paper. High brightness for project printouts.', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80', sku: 'NB-003' },
  { id: 'i27', name: 'Brush Pen Set', category: 'Art Supplies', price: 150, stock: 35, lowStockThreshold: 10, description: '12 assorted flexible tip calligraphy brush pens. Water-based odorless vibrant ink for illustrations.', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80', sku: 'AR-003' },
  { id: 'i28', name: 'Colored Pencils (24 shades)', category: 'Art Supplies', price: 135, stock: 55, lowStockThreshold: 15, description: '24 break-resistant soft lead artist color pencils. Pre-sharpened, non-toxic wood casing.', image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80', sku: 'AR-004' },
  { id: 'i29', name: 'Divider (10-Part A4)', category: 'Files & Folders', price: 38, stock: 70, lowStockThreshold: 15, description: '10-tab multicolored polypropylene index divider with reinforced punch holes for ring binders.', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80', sku: 'FF-003' },
  { id: 'i30', name: 'USB Flash Drive (16GB)', category: 'Office Supplies', price: 395, stock: 3, lowStockThreshold: 5, description: 'SanDisk 16GB USB 3.0 high-speed flash drive with protective slider design. Plug and play.', image: 'https://images.unsplash.com/photo-1624823183493-5f4035654060?w=600&auto=format&fit=crop&q=80', sku: 'OS-006' },
];

const initialSlots = [
  { id: 's1', date: '2026-09-09', time: '9:00 AM – 10:00 AM', capacity: 20, booked: 5 },
  { id: 's2', date: '2026-09-09', time: '10:00 AM – 11:00 AM', capacity: 20, booked: 12 },
  { id: 's3', date: '2026-09-09', time: '11:00 AM – 12:00 PM', capacity: 20, booked: 8 },
  { id: 's4', date: '2026-09-09', time: '2:00 PM – 3:00 PM', capacity: 15, booked: 15 },
  { id: 's5', date: '2026-09-09', time: '3:00 PM – 4:00 PM', capacity: 15, booked: 3 },
  { id: 's6', date: '2026-09-10', time: '9:00 AM – 10:00 AM', capacity: 20, booked: 2 },
  { id: 's7', date: '2026-09-10', time: '10:00 AM – 11:00 AM', capacity: 20, booked: 0 },
  { id: 's8', date: '2026-09-10', time: '11:00 AM – 12:00 PM', capacity: 20, booked: 6 },
  { id: 's9', date: '2026-09-10', time: '2:00 PM – 3:00 PM', capacity: 15, booked: 9 },
  { id: 's10', date: '2026-09-10', time: '3:00 PM – 4:00 PM', capacity: 15, booked: 1 },
];

async function seedDatabase() {
  console.log('🌱 [Database Seed] Starting database seeding process...');

  if (!isFirebaseConnected || !db) {
    console.error('❌ [Database Seed] Firebase is NOT connected.');
    console.error('👉 Please configure your backend/.env with your Firebase Service Account credentials first.');
    process.exit(1);
  }

  try {
    // 1. Seed Inventory
    console.log(`📦 Seeding ${initialItems.length} stationery items to 'inventory' collection...`);
    for (const item of initialItems) {
      await db.collection('inventory').doc(item.id).set({
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    console.log('✅ Inventory collection seeded.');

    // 2. Seed Slots
    console.log(`⏰ Seeding ${initialSlots.length} pickup slots to 'slots' collection...`);
    for (const slot of initialSlots) {
      await db.collection('slots').doc(slot.id).set({
        ...slot,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ Slots collection seeded.');

    console.log('🎉 [Database Seed] All initial data successfully populated into Cloud Firestore!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Database Seed Error]:', error);
    process.exit(1);
  }
}

seedDatabase();
