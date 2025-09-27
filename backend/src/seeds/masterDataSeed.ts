import { AppDataSource, initializeDataSource } from '../typeorm-data-source';

async function run() {
  try {
    await initializeDataSource();
    const productRepo = AppDataSource.getRepository('Product');
    const supplierRepo = AppDataSource.getRepository('Supplier');

    const productCount = await productRepo.count();
    if (productCount === 0) {
      const products = Array.from({ length: 10 }).map((_, i) =>
        productRepo.create({ name: `Product ${i + 1}`, price: (i + 1) * 10 })
      );
      await productRepo.save(products);
    }

    const supplierCount = await supplierRepo.count();
    if (supplierCount === 0) {
      const names = ['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella'];
      const suppliers = names.map((name) => supplierRepo.create({ name }));
      await supplierRepo.save(suppliers);
    }

    console.log('Master data seed completed');
  } catch (err) {
    console.error('Seeding error', err);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
