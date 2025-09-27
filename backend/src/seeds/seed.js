const { AppDataSource, initializeDataSource } = require('../typeorm-data-source');

async function run() {
  try {
    await initializeDataSource();
    const paymentModeRepo = AppDataSource.getRepository('PaymentMode');
    const count = await paymentModeRepo.count();
    if (count === 0) {
      const mode = paymentModeRepo.create({
        name: 'Cash',
        description: 'Cash payment',
        isDefault: true,
      });
      await paymentModeRepo.save(mode);
    }
    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding error', err);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
