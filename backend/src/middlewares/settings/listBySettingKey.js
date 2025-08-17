const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Setting');

const listBySettingKey = async ({ settingKeyArray = [] }) => {
  try {
    if (settingKeyArray.length === 0) {
      return [];
    }
    const conditions = settingKeyArray.map((settingKey) => ({ settingKey, removed: false }));
    const results = await Model.find({ where: conditions });
    return results;
  } catch {
    return [];
  }
};

module.exports = listBySettingKey;
