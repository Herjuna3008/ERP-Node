const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Setting');

const updateManySetting = async (req, res) => {
  // req/body = [{settingKey:"",settingValue}]
  let settingsHasError = false;
  const { settings } = req.body;
  const updates = [];

  for (const setting of settings) {
    if (!setting.hasOwnProperty('settingKey') || !setting.hasOwnProperty('settingValue')) {
      settingsHasError = true;
      break;
    }
    updates.push(setting);
  }

  if (updates.length === 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settings provided ',
    });
  }
  if (settingsHasError) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'Settings provided has Error',
    });
  }
  let updated = 0;
  for (const { settingKey, settingValue } of updates) {
    let record = await Model.findOne({ where: { settingKey } });
    if (record) {
      record.settingValue = settingValue;
      await Model.save(record);
      updated++;
    }
  }
  if (updated === 0) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No settings found by to update',
    });
  }
  return res.status(200).json({
    success: true,
    result: [],
    message: 'we update all settings',
  });
};

module.exports = updateManySetting;
