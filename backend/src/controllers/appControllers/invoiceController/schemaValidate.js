const Joi = require('joi');
const allowedDiscountTypes = ['NONE', 'PERCENTAGE', 'FIXED'];

const itemSchema = Joi.object({
  _id: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null),
  id: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null),
  itemName: Joi.string().required(),
  description: Joi.string().allow(''),
  quantity: Joi.number().required(),
  price: Joi.number().required(),
  unit: Joi.string().allow('', null),
  productId: Joi.alternatives().try(Joi.string(), Joi.number()).allow(null),
  discountType: Joi.string()
    .uppercase()
    .valid(...allowedDiscountTypes)
    .default('NONE'),
  discountValue: Joi.number().min(0).default(0),
  total: Joi.number(),
})
  .unknown(true);

const schema = Joi.object({
  client: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.number()).required(),
  number: Joi.number().required(),
  year: Joi.number().required(),
  status: Joi.string().required(),
  notes: Joi.string().allow(''),
  expiredDate: Joi.date().required(),
  date: Joi.date().required(),
  items: Joi.array().items(itemSchema.required()).min(1).required(),
  taxRate: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
  discount: Joi.alternatives().try(Joi.number(), Joi.string()).allow(null),
  globalDiscountType: Joi.string()
    .uppercase()
    .valid(...allowedDiscountTypes)
    .default('NONE'),
  globalDiscountValue: Joi.alternatives().try(Joi.number(), Joi.string()).default(0),
  subTotal: Joi.any().strip(),
  taxTotal: Joi.any().strip(),
  total: Joi.any().strip(),
  paymentStatus: Joi.any().strip(),
  pdf: Joi.any().strip(),
  credit: Joi.any().strip(),
  balance: Joi.any().strip(),
}).unknown(true);


module.exports = schema;
