const Joi = require('joi');

const schema = Joi.object({
  client: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.number()).required(),
  number: Joi.number().required(),
  year: Joi.number().required(),
  status: Joi.string().valid('DRAFT', 'SENT', 'CONVERTED').required(),
  notes: Joi.string().allow(''),
  dueDate: Joi.date().required(),
  date: Joi.date().required(),
  items: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().allow('').optional(),
        itemName: Joi.string().required(),
        description: Joi.string().allow(''),
        quantity: Joi.number().required(),
        price: Joi.number().required(),
        total: Joi.number().required(),
      }).required()
    )
    .required(),
  taxRate: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
});

module.exports = schema;
