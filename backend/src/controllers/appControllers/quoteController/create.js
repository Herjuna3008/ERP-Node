const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Quote');

const custom = require('@/controllers/pdfController');
const { increaseBySettingKey } = require('@/middlewares/settings');
const { calculate } = require('@/helpers');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const schema = require('./schemaValidate');

const create = async (req, res) => {
  let body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const { items = [], taxRate = 0, discount = 0 } = value;

  // default
  let subTotal = 0;
  let taxTotal = 0;
  let total = 0;
  // let credit = 0;

  //Calculate the items array with subTotal, total, taxTotal
  items.map((item) => {
    let total = calculate.multiply(item['quantity'], item['price']);
    //sub total
    subTotal = calculate.add(subTotal, total);
    //item total
    item['total'] = total;
  });
  taxTotal = calculate.multiply(subTotal, taxRate / 100);
  total = calculate.add(subTotal, taxTotal);

  body = value;

  body['subTotal'] = subTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = items;
  body['createdBy'] = req.admin.id;

  let result = await Model.save(Model.create(body));
  const fileId = 'quote-' + result.id + '.pdf';
  result.pdf = fileId;
  const updateResult = await Model.save(result);
  // Returning successful response

  increaseBySettingKey({
    settingKey: 'last_quote_number',
  });

  // Returning successful response
  return res.status(200).json({
    success: true,
    result: addId(updateResult),
    message: 'Quote created successfully',
  });
};
module.exports = create;
