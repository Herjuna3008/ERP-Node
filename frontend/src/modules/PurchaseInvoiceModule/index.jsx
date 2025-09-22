import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import useLanguage from '@/locale/useLanguage';
import purchaseInvoiceService from '@/services/purchaseInvoiceService';

const statusOptions = [
  { value: 'draft', label: 'draft', color: 'default' },
  { value: 'sent', label: 'sent', color: 'blue' },
  { value: 'confirmed', label: 'confirmed', color: 'green' },
  { value: 'paid', label: 'paid', color: 'gold' },
];

const discountOptions = [
  { value: 'amount', label: 'amount', color: 'geekblue' },
  { value: 'percent', label: 'percentage', color: 'purple' },
];

const fields = {
  supplier: {
    type: 'async',
    label: 'supplier',
    entity: 'supplier',
    displayLabels: ['name'],
    outputValue: 'id',
    dataIndex: ['supplier', 'name'],
  },
  number: {
    type: 'string',
    label: 'number',
    required: true,
  },
  date: {
    type: 'date',
    label: 'date',
    required: true,
  },
  dueDate: {
    type: 'date',
    label: 'due_date',
  },
  status: {
    type: 'selectWithTranslation',
    label: 'status',
    options: statusOptions,
    renderAsTag: true,
    defaultValue: 'draft',
  },
  taxRate: {
    type: 'number',
    label: 'tax_rate',
  },
  currency: {
    type: 'string',
    label: 'currency',
  },
  globalDiscountType: {
    type: 'selectWithTranslation',
    label: 'global_discount_type',
    options: discountOptions,
    renderAsTag: true,
    defaultValue: 'amount',
  },
  globalDiscountValue: {
    type: 'number',
    label: 'global_discount_value',
  },
  notes: {
    type: 'textarea',
    label: 'notes',
    disableForTable: true,
  },
  subTotal: {
    type: 'currency',
    label: 'sub_total',
    disableForForm: true,
  },
  taxTotal: {
    type: 'currency',
    label: 'tax_total',
    disableForForm: true,
  },
  total: {
    type: 'currency',
    label: 'total',
    disableForForm: true,
  },
};

const PurchaseInvoiceModule = () => {
  const translate = useLanguage();
  const entity = 'purchaseinvoice';

  const Labels = {
    PANEL_TITLE: translate('purchase_invoice'),
    DATATABLE_TITLE: translate('purchase_invoice_list'),
    ADD_NEW_ENTITY: translate('add_new_purchase_invoice'),
    ENTITY_NAME: translate('purchase_invoice'),
  };

  const searchConfig = {
    displayLabels: ['number'],
    searchFields: 'number',
    outputValue: 'id',
  };

  const deleteModalLabels = ['number', 'supplier.name'];

  const config = {
    entity,
    service: purchaseInvoiceService,
    fields,
    searchConfig,
    deleteModalLabels,
    ...Labels,
  };

  return (
    <CrudModule
      config={config}
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm />}
    />
  );
};

export default PurchaseInvoiceModule;
