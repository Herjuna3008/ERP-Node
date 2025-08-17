require('module-alias/register');
const { AppDataSource } = require('./typeorm-data-source');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// Initialize database connection then start server
AppDataSource.initialize()
  .then(() => {
    console.log('Connected to MySQL');
    const app = require('./app');
    app.set('port', process.env.PORT || 8888);
    const server = app.listen(app.get('port'), () => {
      console.log(`Express running → On PORT : ${server.address().port}`);
    });
  })
  .catch((error) => {
    console.error('Error during Data Source initialization', error);
  });
