const { Joi, id, quantity, price, date } = require('@/validators');

const itemSchema = Joi.object({
  product: id.required(),
  quantity: quantity.required(),
  cost: price.required(),
});

const schema = Joi.object({
  supplier: id.required(),
  date: date.required(),
  notes: Joi.string().allow(''),
  items: Joi.array().items(itemSchema).min(1),
});

module.exports = schema;
