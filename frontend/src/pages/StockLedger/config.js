export const fields = {
  product: {
    type: 'async',
    entity: 'product',
    displayLabels: ['name'],
    outputValue: 'id',
    dataIndex: ['product', 'name'],
    required: true,
  },
  entryType: {
    type: 'selectWithTranslation',
    options: [
      { label: 'IN', value: 'IN' },
      { label: 'OUT', value: 'OUT' },
    ],
    required: true,
  },
  quantity: {
    type: 'number',
    required: true,
  },
  costPrice: {
    type: 'number',
    label: 'cost_price',
  },
  sellPrice: {
    type: 'number',
    label: 'sell_price',
  },
  sourceType: {
    type: 'selectWithTranslation',
    options: [
      { label: 'purchase_invoice', value: 'purchase_invoice' },
      { label: 'sales_invoice', value: 'sales_invoice' },
      { label: 'adjustment', value: 'adjustment' },
    ],
    required: true,
  },
  sourceId: {
    type: 'number',
    label: 'source_id',
  },
  sourceItemId: {
    type: 'number',
    label: 'source_item_id',
  },
  notes: {
    type: 'textarea',
  },
  created: {
    type: 'date',
    disableForForm: true,
    disableForUpdate: true,
  },
};
