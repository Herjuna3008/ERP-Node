const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Invoice');

const { calculate } = require('@/helpers');
const { increaseBySettingKey } = require('@/middlewares/settings');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const { computeTotals } = require('@/services/invoiceCalculationService');
const invoiceStockService = require('@/services/invoiceStockService');
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

  const {
    items = [],
    taxRate = 0,
    globalDiscountType,
    globalDiscountValue,
  } = value;

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
    globalDiscountType,
    globalDiscountValue,
    taxRate,
  });

  body['subTotal'] = subTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = normalizedItems;
  body['discount'] = discountAmount;
  body['globalDiscountType'] = normalizedGlobalDiscountType;
  body['globalDiscountValue'] = normalizedGlobalDiscountValue;
  body['taxRate'] = normalizedTaxRate;

  let paymentStatus = calculate.sub(total, discountAmount) === 0 ? 'paid' : 'unpaid';

  body['paymentStatus'] = paymentStatus;
  body['createdBy'] = req.admin.id;

  let result = await Model.save(Model.create(body));
  const fileId = 'invoice-' + result.id + '.pdf';
  result.pdf = fileId;
  const updateResult = await Model.save(result);

  // Decrement stock (ledger OUT) when the invoice is committed (non-draft).
  await invoiceStockService.syncInvoiceStock(updateResult);

  increaseBySettingKey({
    settingKey: 'last_invoice_number',
  });

  // Returning successful response
  return res.status(200).json({
    success: true,
    result: addId(updateResult),
    message: 'Invoice created successfully',
  });
};

module.exports = create;
