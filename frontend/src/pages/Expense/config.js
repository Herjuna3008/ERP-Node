export const fields = {
  description: {
    type: 'textarea',
  },
  reference: {
    type: 'string',
  },
  amount: {
    type: 'currency',
    required: true,
  },
  expenseDate: {
    type: 'date',
    required: true,
  },
  category: {
    type: 'async',
    entity: 'expensecategory',
    displayLabels: ['name'],
    outputValue: 'id',
    dataIndex: ['category', 'name'],
  },
  supplier: {
    type: 'async',
    entity: 'supplier',
    displayLabels: ['name'],
    outputValue: 'id',
    dataIndex: ['supplier', 'name'],
  },
  invoice: {
    type: 'async',
    entity: 'invoice',
    displayLabels: ['number'],
    outputValue: 'id',
    dataIndex: ['invoice', 'number'],
  },
};
