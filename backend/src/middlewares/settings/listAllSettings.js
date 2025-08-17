const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Setting');

const listAllSettings = async () => {
  try {
    //  Query the database for a list of all results
    const result = await Model.find({ where: { removed: false } });
    return result;
  } catch {
    return [];
  }
};

module.exports = listAllSettings;
