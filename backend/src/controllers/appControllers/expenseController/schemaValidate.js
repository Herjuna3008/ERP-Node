const { Joi, id, price, date } = require('@/validators');

const schema = Joi.object({
  amount: price.required(),
  date: date.required(),
  description: Joi.string().allow(''),
  category: id.required(),
  employee: id.allow(null),
  payroll: id.allow(null),
});

module.exports = schema;
