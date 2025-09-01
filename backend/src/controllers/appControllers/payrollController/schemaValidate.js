const { Joi, id, price, date } = require('@/validators');

const schema = Joi.object({
  employee: id.required(),
  amount: price.required(),
  date: date.required(),
  description: Joi.string().allow(''),
  category: id.required(),
});

module.exports = schema;
