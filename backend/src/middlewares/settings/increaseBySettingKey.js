const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Setting');

const increaseBySettingKey = async ({ settingKey }) => {
  try {
    if (!settingKey) {
      return null;
    }

    let result = await Model.findOne({ where: { settingKey } });
    if (!result) {
      return null;
    }
    result.settingValue = (result.settingValue || 0) + 1;
    result = await Model.save(result);
    return result;
  } catch {
    return null;
  }
};

module.exports = increaseBySettingKey;
