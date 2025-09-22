export const fields = {
  name: {
    type: 'string',
    required: true,
  },
  sku: {
    type: 'string',
    label: 'SKU',
  },
  unit: {
    type: 'string',
    defaultValue: 'unit',
  },
  price: {
    type: 'number',
    label: 'price',
    required: true,
  },
  stockQuantity: {
    type: 'number',
    label: 'stock_quantity',
    disableForForm: true,
    disableForUpdate: true,
  },
  lastCostPrice: {
    type: 'number',
    label: 'last_cost_price',
    disableForForm: true,
    disableForUpdate: true,
  },
  lastSellPrice: {
    type: 'number',
    label: 'last_sell_price',
    disableForForm: true,
    disableForUpdate: true,
  },
  description: {
    type: 'textarea',
    label: 'description',
  },
};
