const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Quote');

const custom = require('@/controllers/pdfController');

const { calculate } = require('@/helpers');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const schema = require('./schemaValidate');

const update = async (req, res) => {
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

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Items cannot be empty',
    });
  }
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
  body['pdf'] = 'quote-' + req.params.id + '.pdf';

  if (body.hasOwnProperty('currency')) {
    delete body.currency;
  }
  // Find document by id and updates with the required fields

  let result = await Model.findOne({ where: { id: req.params.id, removed: false } });
  if (!result) {
    return res.status(404).json({ success: false, result: null, message: 'No document found' });
  }
  Model.merge(result, body);
  result = await Model.save(result);

  // Returning successful response

  return res.status(200).json({
    success: true,
    result: addId(result),
    message: 'we update this document ',
  });
};
module.exports = update;
