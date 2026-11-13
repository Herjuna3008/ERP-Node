/*
 * Demo data seeder. Goes through the HTTP API (not raw SQL) so every business
 * rule runs: server-side numbering, stock ledger IN/OUT, payment status.
 *
 *   node src/setup/seedDemo.js            # refuses to run if clients already exist
 *   node src/setup/seedDemo.js --force    # append anyway
 *
 * Env: SEED_API_URL (default http://localhost:8888/api),
 *      SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (default admin@admin.com / admin123)
 */

const API = (process.env.SEED_API_URL || 'http://localhost:8888/api').replace(/\/$/, '');
const EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@admin.com';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123';
const FORCE = process.argv.includes('--force');

let token = null;

const api = async (path, body) => {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(`${path} -> ${res.status} ${json.message || JSON.stringify(json)}`);
  }
  return json.result;
};

const get = async (path) => {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  if (!res.ok || json.success === false) throw new Error(`${path} -> ${json.message}`);
  return json.result;
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const daysFrom = (iso, n) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const year = new Date().getFullYear();

// ---------------------------------------------------------------- data

const CLIENTS = [
  { name: 'Warung Padang Sederhana', email: 'padangsederhana@gmail.com', phone: '021-5550101', country: 'Indonesia', address: 'Jl. Kramat Raya No. 12, Jakarta Pusat' },
  { name: 'RM Sunda Kuring', email: 'order@sundakuring.id', phone: '022-5550202', country: 'Indonesia', address: 'Jl. Setiabudi No. 88, Bandung' },
  { name: 'Katering Bu Hajah Siti', email: 'katering.busiti@gmail.com', phone: '0812-3456-7890', country: 'Indonesia', address: 'Jl. Kaliurang Km 5, Yogyakarta' },
  { name: 'Hotel Grand Melati', email: 'purchasing@grandmelati.com', phone: '031-5550303', country: 'Indonesia', address: 'Jl. Basuki Rahmat No. 101, Surabaya' },
  { name: 'Cafe Kopi Senja', email: 'kopisenja@yahoo.com', phone: '0856-1122-3344', country: 'Indonesia', address: 'Jl. Pandanaran No. 27, Semarang' },
  { name: 'PT Boga Rasa Nusantara', email: 'finance@bogarasa.co.id', phone: '021-5550404', country: 'Indonesia', address: 'Jl. TB Simatupang Kav. 3, Jakarta Selatan' },
  { name: 'Kantin Sekolah Harapan Bangsa', email: 'kantin.harapan@gmail.com', phone: '0361-5550505', country: 'Indonesia', address: 'Jl. Teuku Umar No. 9, Denpasar' },
  { name: 'Steak House Lembang', email: 'order@steakhouselembang.id', phone: '022-5550606', country: 'Indonesia', address: 'Jl. Raya Lembang No. 45, Bandung Barat' },
];

const SUPPLIERS = [
  { name: 'Kelompok Tani Sayur Lembang', email: 'poktan.lembang@gmail.com', phone: '0813-7770101', address: 'Desa Cibodas, Lembang, Bandung Barat' },
  { name: 'CV Buah Segar Nusantara', email: 'order@buahsegar.id', phone: '021-7770202', address: 'Pasar Induk Kramat Jati Blok C-12, Jakarta' },
  { name: 'PT Rempah Jaya Abadi', email: 'sales@rempahjaya.co.id', phone: '031-7770303', address: 'Jl. Kembang Jepun No. 77, Surabaya' },
  { name: 'RPH Berkah Daging Segar', email: 'rph.berkah@gmail.com', phone: '0812-9988-7766', address: 'Jl. Raya Bogor Km 28, Depok' },
  { name: 'Toko Alat Dapur Sumber Rejeki', email: 'sumberrejeki.dapur@gmail.com', phone: '021-7770505', address: 'Pasar Jatinegara Lt. 2 No. 15, Jakarta Timur' },
];

// price = default sell price; cost = opening stock cost; stock = opening qty (adjustment ledger)
const PRODUCTS = [
  // Sayuran
  { name: 'Bayam Hijau', sku: 'SAY-BAYAM', unit: 'ikat', price: 4000, cost: 2500, stock: 50, description: 'Bayam segar petik pagi' },
  { name: 'Kangkung', sku: 'SAY-KANGKUNG', unit: 'ikat', price: 3500, cost: 2000, stock: 60, description: 'Kangkung darat' },
  { name: 'Wortel Lembang', sku: 'SAY-WORTEL', unit: 'kg', price: 15000, cost: 11000, stock: 40, description: 'Wortel grade A' },
  { name: 'Brokoli', sku: 'SAY-BROKOLI', unit: 'kg', price: 32000, cost: 25000, stock: 20, description: 'Brokoli hijau segar' },
  { name: 'Tomat Merah', sku: 'SAY-TOMAT', unit: 'kg', price: 14000, cost: 9000, stock: 45, description: 'Tomat buah merah' },
  // Buah
  { name: 'Pisang Cavendish', sku: 'BUA-PISANG', unit: 'kg', price: 22000, cost: 16000, stock: 30, description: 'Pisang cavendish matang pohon' },
  { name: 'Apel Fuji', sku: 'BUA-APEL', unit: 'kg', price: 38000, cost: 30000, stock: 25, description: 'Apel fuji impor' },
  { name: 'Jeruk Medan', sku: 'BUA-JERUK', unit: 'kg', price: 28000, cost: 21000, stock: 35, description: 'Jeruk medan manis' },
  { name: 'Semangka Merah', sku: 'BUA-SEMANGKA', unit: 'buah', price: 35000, cost: 25000, stock: 15, description: 'Semangka non biji 4-5 kg' },
  // Bumbu
  { name: 'Bawang Merah Brebes', sku: 'BUM-BAWANGMERAH', unit: 'kg', price: 42000, cost: 34000, stock: 30, description: 'Bawang merah brebes super' },
  { name: 'Bawang Putih Kating', sku: 'BUM-BAWANGPUTIH', unit: 'kg', price: 38000, cost: 30000, stock: 30, description: 'Bawang putih kating' },
  { name: 'Cabai Rawit Merah', sku: 'BUM-CABAIRAWIT', unit: 'kg', price: 65000, cost: 50000, stock: 20, description: 'Cabai rawit merah segar' },
  { name: 'Kunyit Segar', sku: 'BUM-KUNYIT', unit: 'kg', price: 18000, cost: 12000, stock: 15, description: 'Kunyit rimpang segar' },
  // Daging
  { name: 'Daging Sapi Has Dalam', sku: 'DAG-SAPI-TENDERLOIN', unit: 'kg', price: 145000, cost: 125000, stock: 20, description: 'Tenderloin sapi lokal' },
  { name: 'Ayam Broiler Utuh', sku: 'DAG-AYAM-UTUH', unit: 'ekor', price: 48000, cost: 40000, stock: 40, description: 'Ayam broiler 1.0-1.2 kg/ekor' },
  { name: 'Daging Kambing', sku: 'DAG-KAMBING', unit: 'kg', price: 160000, cost: 140000, stock: 10, description: 'Daging kambing muda' },
  // Alat dapur
  { name: 'Pisau Dapur Stainless 8"', sku: 'ALT-PISAU-8', unit: 'pcs', price: 85000, cost: 60000, stock: 25, description: 'Pisau chef stainless steel 8 inch' },
  { name: 'Talenan Kayu Jati', sku: 'ALT-TALENAN', unit: 'pcs', price: 45000, cost: 30000, stock: 30, description: 'Talenan kayu jati 30x20 cm' },
  { name: 'Wajan Anti Lengket 28cm', sku: 'ALT-WAJAN-28', unit: 'pcs', price: 165000, cost: 125000, stock: 12, description: 'Wajan teflon 28 cm' },
  { name: 'Panci Stainless 24cm', sku: 'ALT-PANCI-24', unit: 'pcs', price: 210000, cost: 160000, stock: 10, description: 'Panci stainless steel 24 cm dengan tutup' },
];

const EXPENSE_CATEGORIES = [
  { name: 'Sewa & Utilitas', description: 'Sewa gudang, listrik, air, internet' },
  { name: 'Gaji Karyawan', description: 'Gaji dan tunjangan' },
  { name: 'Transportasi & Pengiriman', description: 'Ongkir, bensin, kurir, sewa mobil box' },
  { name: 'Pemasaran', description: 'Iklan dan promosi' },
];

// ---------------------------------------------------------------- seed

const main = async () => {
  console.log(`Seeding demo data via ${API}`);
  const login = await api('/login', { email: EMAIL, password: PASSWORD });
  token = login.token;

  const existing = await get('/client/list?page=1&items=1');
  const existingCount = existing?.pagination?.count ?? existing?.length ?? 0;
  if (existingCount > 0 && !FORCE) {
    console.log(`Found ${existingCount} client(s) already. Use --force to append anyway.`);
    process.exit(0);
  }

  // Master data -------------------------------------------------------------
  const ppn = await api('/taxes/create', { taxName: 'PPN 11%', taxValue: 11, isDefault: false, enabled: true });
  const modeTransfer = await api('/paymentmode/create', { name: 'Transfer Bank BCA', description: 'BCA 123-456-7890 a.n. CuanFlow', isDefault: false, enabled: true });
  const modeCash = await api('/paymentmode/create', { name: 'Tunai', description: 'Pembayaran tunai di kasir', isDefault: false, enabled: true });
  console.log('tax + payment modes ok');

  const clients = [];
  for (const c of CLIENTS) clients.push(await api('/client/create', c));
  console.log(`clients: ${clients.length}`);

  const suppliers = [];
  for (const s of SUPPLIERS) suppliers.push(await api('/supplier/create', s));
  console.log(`suppliers: ${suppliers.length}`);

  const products = [];
  for (const p of PRODUCTS) {
    const { cost, stock, ...rest } = p;
    products.push(await api('/product/create', { ...rest, stockQuantity: stock, lastCostPrice: cost }));
  }
  console.log(`products: ${products.length} (opening stock via adjustment ledger)`);

  const categories = [];
  for (const c of EXPENSE_CATEGORIES) categories.push(await api('/expensecategory/create', c));
  console.log(`expense categories: ${categories.length}`);

  const P = (i) => products[i];
  const C = (i) => clients[i];
  const S = (i) => suppliers[i];

  // Purchase invoices (sent -> stock IN) -------------------------------------
  const purchases = [
    { supplier: S(0), status: 'sent', date: daysAgo(60), items: [[0, 100, 2200], [1, 100, 1800], [2, 50, 10500], [4, 50, 8500]] },
    { supplier: S(3), status: 'sent', date: daysAgo(45), items: [[13, 30, 122000], [14, 50, 38000]] },
    { supplier: S(1), status: 'sent', date: daysAgo(30), items: [[5, 40, 15500], [6, 30, 29000], [7, 40, 20000]] },
    { supplier: S(2), status: 'sent', date: daysAgo(20), items: [[9, 40, 33000], [10, 40, 29000], [11, 25, 48000]] },
    { supplier: S(4), status: 'draft', date: daysAgo(3), items: [[16, 20, 58000], [18, 10, 120000]] },
  ];
  let piNo = 1;
  for (const pi of purchases) {
    await api('/purchaseinvoice/create', {
      number: `PI-${year}-${String(piNo++).padStart(3, '0')}`,
      year,
      status: pi.status,
      date: pi.date,
      dueDate: daysFrom(pi.date, 30),
      supplier: { id: pi.supplier.id },
      taxRate: 11,
      globalDiscountType: 'amount',
      globalDiscountValue: 0,
      notes: 'Pembelian stok bahan baku',
      items: pi.items.map(([idx, qty, unitPrice]) => ({
        product: P(idx).id,
        description: P(idx).name,
        quantity: qty,
        unitPrice,
        discountType: 'amount',
        discountValue: 0,
      })),
    });
  }
  console.log(`purchase invoices: ${purchases.length}`);

  // Quotes ---------------------------------------------------------------
  const quoteItem = (idx, qty) => ({
    itemName: P(idx).name,
    description: P(idx).description,
    quantity: qty,
    price: P(idx).price,
    total: qty * P(idx).price,
  });
  const quotes = [
    { client: C(3), status: 'SENT', date: daysAgo(40), items: [quoteItem(13, 10), quoteItem(14, 20), quoteItem(3, 10), quoteItem(2, 15)] },
    { client: C(5), status: 'SENT', date: daysAgo(12), items: [quoteItem(5, 20), quoteItem(6, 10), quoteItem(7, 15)] },
    { client: C(2), status: 'DRAFT', date: daysAgo(2), items: [quoteItem(9, 10), quoteItem(10, 10), quoteItem(11, 5)] },
    { client: C(7), status: 'SENT', date: daysAgo(7), items: [quoteItem(13, 15), quoteItem(16, 4), quoteItem(18, 2)] },
    { client: C(4), status: 'DRAFT', date: daysAgo(1), items: [quoteItem(5, 10), quoteItem(19, 2)] },
  ];
  const createdQuotes = [];
  for (const q of quotes) {
    createdQuotes.push(
      await api('/quote/create', {
        client: q.client.id,
        number: 0,
        year,
        status: q.status,
        date: q.date,
        dueDate: daysFrom(q.date, 14),
        taxRate: 11,
        notes: 'Penawaran harga berlaku 14 hari.',
        items: q.items,
      })
    );
  }
  // Convert the first SENT quote -> invoice (exercises the convert flow)
  await api(`/quotes/${createdQuotes[0].id}/convert`, {});
  console.log(`quotes: ${quotes.length} (1 converted to invoice)`);

  // Sales invoices (non-draft -> stock OUT) -----------------------------------
  const invItem = (idx, qty, price) => ({
    itemName: P(idx).name,
    description: P(idx).description,
    quantity: qty,
    price: price ?? P(idx).price,
    productId: P(idx).id,
    discountType: 'NONE',
    discountValue: 0,
  });
  const invoices = [
    { client: C(0), status: 'sent', date: daysAgo(55), pay: 'full', items: [invItem(9, 10), invItem(10, 10), invItem(11, 5), invItem(14, 15)] },
    { client: C(1), status: 'sent', date: daysAgo(48), pay: 'full', items: [invItem(0, 30), invItem(1, 30), invItem(4, 15), invItem(12, 3)] },
    { client: C(3), status: 'sent', date: daysAgo(35), pay: 'partial', items: [invItem(13, 12), invItem(15, 5), invItem(3, 8)], gd: ['PERCENTAGE', 5] },
    { client: C(4), status: 'sent', date: daysAgo(30), pay: 'none', items: [invItem(5, 15), invItem(6, 8), invItem(7, 10)] },
    { client: C(5), status: 'pending', date: daysAgo(14), pay: 'partial', items: [invItem(14, 30), invItem(2, 20), invItem(4, 20)] },
    { client: C(7), status: 'sent', date: daysAgo(9), pay: 'full', items: [invItem(13, 10), invItem(16, 3), invItem(18, 2, 160000)] },
    { client: C(6), status: 'pending', date: daysAgo(4), pay: 'none', items: [invItem(8, 5), invItem(5, 10), invItem(17, 5)], gd: ['FIXED', 25000] },
    { client: C(2), status: 'draft', date: daysAgo(1), pay: 'none', items: [invItem(19, 2), invItem(18, 2), invItem(16, 5)] },
  ];
  let paymentNo = 1;
  let paymentCount = 0;
  for (const inv of invoices) {
    const created = await api('/invoice/create', {
      client: inv.client.id,
      number: 0,
      year,
      status: inv.status,
      date: inv.date,
      expiredDate: daysFrom(inv.date, 30),
      taxRate: 11,
      globalDiscountType: inv.gd?.[0] || 'NONE',
      globalDiscountValue: inv.gd?.[1] || 0,
      notes: 'Terima kasih atas kepercayaan Anda.',
      items: inv.items,
    });
    const due = Number(created.total) - Number(created.discount || 0);
    const pays =
      inv.pay === 'full' ? [due] : inv.pay === 'partial' ? [Math.round(due * 0.4)] : [];
    for (const amount of pays) {
      await api('/payment/create', {
        number: paymentNo++,
        client: inv.client.id,
        invoice: created.id,
        date: daysFrom(inv.date, 5),
        amount,
        paymentMode: paymentCount % 2 === 0 ? modeTransfer.id : modeCash.id,
        ref: `TRF-${year}${String(paymentNo).padStart(4, '0')}`,
        description: inv.pay === 'full' ? 'Pelunasan' : 'Uang muka 40%',
      });
      paymentCount++;
    }
  }
  console.log(`invoices: ${invoices.length}, payments: ${paymentCount}`);

  // Expenses -------------------------------------------------------------
  const expenses = [
    { cat: 0, amount: 7500000, date: daysAgo(58), ref: 'SEWA-10', desc: 'Sewa gudang & cold storage bulan lalu' },
    { cat: 0, amount: 1850000, date: daysAgo(50), ref: 'PLN-10', desc: 'Listrik & internet' },
    { cat: 1, amount: 18000000, date: daysAgo(28), ref: 'GAJI-10', desc: 'Gaji 4 karyawan' },
    { cat: 2, amount: 650000, date: daysAgo(26), ref: 'JNE-1123', desc: 'Sewa mobil box pengiriman Bandung', supplier: 0 },
    { cat: 3, amount: 2500000, date: daysAgo(15), ref: 'ADS-11', desc: 'Iklan Instagram & Marketplace' },
    { cat: 0, amount: 7500000, date: daysAgo(6), ref: 'SEWA-11', desc: 'Sewa gudang & cold storage bulan ini' },
    { cat: 2, amount: 420000, date: daysAgo(2), ref: 'GRAB-0912', desc: 'Kurir instan Jakarta', supplier: 4 },
  ];
  for (const e of expenses) {
    await api('/expense/create', {
      description: e.desc,
      reference: e.ref,
      amount: e.amount,
      expenseDate: e.date,
      category: { id: categories[e.cat].id },
      ...(e.supplier !== undefined ? { supplier: { id: S(e.supplier).id } } : {}),
    });
  }
  console.log(`expenses: ${expenses.length}`);

  console.log('\nDemo data seeded. Login: ' + EMAIL);
};

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
