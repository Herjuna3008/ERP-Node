export const fields = {
  number: {
    type: 'string',
    required: true,
  },
  supplier: {
    type: 'async',
    entity: 'supplier',
    displayLabels: ['name'],
    outputValue: 'id',
    dataIndex: ['supplier', 'name'],
    required: true,
  },
  date: {
    type: 'date',
    required: true,
  },
  dueDate: {
    type: 'date',
  },
  status: {
    type: 'selectWithTranslation',
    options: [
      { label: 'draft', value: 'draft' },
      { label: 'sent', value: 'sent' },
      { label: 'confirmed', value: 'confirmed' },
    ],
    defaultValue: 'draft',
  },
  taxRate: {
    type: 'number',
    label: 'tax_rate',
  },
  globalDiscountType: {
    type: 'selectWithTranslation',
    options: [
      { label: 'amount', value: 'amount' },
      { label: 'percent', value: 'percent' },
    ],
    defaultValue: 'amount',
  },
  globalDiscountValue: {
    type: 'number',
    label: 'global_discount_value',
  },
  currency: {
    type: 'string',
    defaultValue: 'NA',
  },
  notes: {
    type: 'textarea',
  },
  subTotal: {
    type: 'number',
    label: 'sub_total',
    disableForForm: true,
    disableForUpdate: true,
  },
  taxTotal: {
    type: 'number',
    label: 'tax_total',
    disableForForm: true,
    disableForUpdate: true,
  },
  total: {
    type: 'number',
    disableForForm: true,
    disableForUpdate: true,
  },
};
