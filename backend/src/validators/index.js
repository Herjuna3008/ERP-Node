const Joi = require('joi');

const id = Joi.number().integer().positive();
const quantity = Joi.number().positive();
const price = Joi.number().positive();
const date = Joi.date();

module.exports = { Joi, id, quantity, price, date };
