const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Setting');

const readBySettingKey = async ({ settingKey }) => {
  try {
    // Find document by id

    if (!settingKey) {
      return null;
    }
    const result = await Model.findOne({ where: { settingKey } });
    return result || null;
  } catch {
    return null;
  }
};

module.exports = readBySettingKey;
