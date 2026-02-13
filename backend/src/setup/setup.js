require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { initializeDataSource } = require('../typeorm-data-source');
const { ensureBootstrapData } = require('./bootstrapDefaults');

async function setupApp() {
  try {
    const dataSource = await initializeDataSource();
    await ensureBootstrapData(dataSource, { createDemoAdmin: true });

    console.log('🥳 Setup completed :Success!');
    process.exit();
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit();
  }
}

setupApp();
