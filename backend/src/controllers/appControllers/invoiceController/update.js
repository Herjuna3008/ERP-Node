const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Invoice');

const custom = require('@/controllers/pdfController');

const { calculate } = require('@/helpers');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const { computeTotals } = require('@/services/invoiceCalculationService');
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

  const previousInvoice = await Model.findOne({ where: { id: req.params.id, removed: false } });

  const { credit } = previousInvoice;

  const { items = [], taxRate, globalDiscountType, globalDiscountValue } = value;

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Items cannot be empty',
    });
  }

  const {
    items: normalizedItems,
    subTotal,
    discountAmount,
    taxTotal,
    total,
    globalDiscountType: normalizedGlobalDiscountType,
    globalDiscountValue: normalizedGlobalDiscountValue,
    taxRate: normalizedTaxRate,
  } = computeTotals({
    items,
    globalDiscountType: globalDiscountType ?? previousInvoice.globalDiscountType,
    globalDiscountValue: globalDiscountValue ?? previousInvoice.globalDiscountValue,
    taxRate: typeof taxRate !== 'undefined' ? taxRate : previousInvoice.taxRate,
  });

  body['subTotal'] = subTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = normalizedItems;
  body['discount'] = discountAmount;
  body['globalDiscountType'] = normalizedGlobalDiscountType;
  body['globalDiscountValue'] = normalizedGlobalDiscountValue;
  body['taxRate'] = normalizedTaxRate;
  body['pdf'] = 'invoice-' + req.params.id + '.pdf';
  if (body.hasOwnProperty('currency')) {
    delete body.currency;
  }
  // Find document by id and updates with the required fields

  let paymentStatus =
    calculate.sub(total, discountAmount) === credit ? 'paid' : credit > 0 ? 'partially' : 'unpaid';
  body['paymentStatus'] = paymentStatus;

  Model.merge(previousInvoice, body);
  const result = await Model.save(previousInvoice);

  // Returning successful response

  return res.status(200).json({
    success: true,
    result: addId(result),
    message: 'we update this document ',
  });
};

module.exports = update;
