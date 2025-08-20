const { AppDataSource } = require('@/typeorm-data-source');
const { Not } = require('typeorm');
const Model = AppDataSource.getRepository('PaymentMode');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController(Model);

delete methods['delete'];

methods.create = async (req, res) => {
  const { isDefault } = req.body;

  if (isDefault) {
    await Model.update({}, { isDefault: false });
  }

  const countDefault = await Model.count({ where: { isDefault: true } });
  const result = await Model.save(
    Model.create({ ...req.body, isDefault: countDefault < 1 ? true : false })
  );

  return res.status(200).json({
    success: true,
    result: result,
    message: 'payment mode created successfully',
  });
};

methods.delete = async (req, res) => {
  return res.status(403).json({
    success: false,
    result: null,
    message: "you can't delete payment mode after it has been created",
  });
};

methods.update = async (req, res) => {
  const { id } = req.params;
  const paymentMode = await Model.findOne({ where: { id: req.params.id, removed: false } });

  if (!paymentMode) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'payment mode not found',
    });
  } else {
    const { isDefault = paymentMode.isDefault, enabled = paymentMode.enabled } = req.body;

    // if isDefault:false , we update first - isDefault:true
    // if enabled:false and isDefault:true , we update first - isDefault:true
    if (!isDefault || (!enabled && isDefault)) {
      await Model.update({ id: Not(id), enabled: true }, { isDefault: true });
    }

    // if isDefault:true and enabled:true, we update other paymentMode and make is isDefault:false
    if (isDefault && enabled) {
      await Model.update({ id: Not(id) }, { isDefault: false });
    }

    const paymentModeCount = await Model.count();

    // if enabled:false and it's only one exist, we can't disable
    if ((!enabled || !isDefault) && paymentModeCount <= 1) {
      return res.status(422).json({
        success: false,
        result: null,
        message: 'You cannot disable the paymentMode because it is the only existing one',
      });
    }

    Model.merge(paymentMode, req.body);
    const result = await Model.save(paymentMode);

    return res.status(200).json({
      success: true,
      message: 'paymentMode updated successfully',
      result,
    });
  }
};

module.exports = methods;
