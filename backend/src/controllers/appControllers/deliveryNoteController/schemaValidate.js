const { Joi, id, quantity, date } = require('@/validators');

const itemSchema = Joi.object({
  product: id.required(),
  quantity: quantity.required(),
});

const schema = Joi.object({
  client: id.required(),
  date: date.required(),
  notes: Joi.string().allow(''),
  items: Joi.array().items(itemSchema).min(1),
});

module.exports = schema;
