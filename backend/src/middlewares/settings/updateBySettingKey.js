const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Setting');

const updateBySettingKey = async ({ settingKey, settingValue }) => {
  try {
    if (!settingKey || settingValue === undefined) {
      return null;
    }
    let result = await Model.findOne({ where: { settingKey } });
    if (!result) {
      return null;
    }
    result.settingValue = settingValue;
    result = await Model.save(result);
    return result;
  } catch {
    return null;
  }
};

module.exports = updateBySettingKey;
