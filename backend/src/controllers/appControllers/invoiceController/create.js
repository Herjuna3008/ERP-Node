const { AppDataSource } = require('@/typeorm-data-source');

const { calculate } = require('@/helpers');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const { computeTotals } = require('@/services/invoiceCalculationService');
const invoiceStockService = require('@/services/invoiceStockService');
const { assignNextNumber } = require('@/services/numberingService');
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

  // Number is server-assigned (HANDOVER bug I): the frontend value is ignored. The counter bump
  // and the invoice insert share one transaction + row lock so concurrent creates can never get
  // the same number.
  const updateResult = await AppDataSource.transaction(async (manager) => {
    const invoiceRepo = manager.getRepository('Invoice');
    body['number'] = await assignNextNumber({
      manager,
      settingKey: 'last_invoice_number',
      tableName: 'invoices',
    });
    let result = await invoiceRepo.save(invoiceRepo.create(body));
    result.pdf = 'invoice-' + result.id + '.pdf';
    return invoiceRepo.save(result);
  });

  // Decrement stock (ledger OUT) when the invoice is committed (non-draft).
  await invoiceStockService.syncInvoiceStock(updateResult);

  // Returning successful response
  return res.status(200).json({
    success: true,
    result: addId(updateResult),
    message: 'Invoice created successfully',
  });
};

module.exports = create;
