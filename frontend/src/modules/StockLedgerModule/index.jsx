import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import useLanguage from '@/locale/useLanguage';
import stockLedgerService from '@/services/stockLedgerService';

const entryTypeOptions = [
  { value: 'IN', label: 'in', color: 'green' },
  { value: 'OUT', label: 'out', color: 'volcano' },
];

const fields = {
  product: {
    type: 'async',
    label: 'product',
    entity: 'product',
    displayLabels: ['name'],
    outputValue: 'id',
    dataIndex: ['product', 'name'],
    required: true,
  },
  entryType: {
    type: 'selectWithTranslation',
    label: 'entry_type',
    options: entryTypeOptions,
    renderAsTag: true,
    required: true,
  },
  quantity: {
    type: 'number',
    label: 'quantity',
    required: true,
  },
  costPrice: {
    type: 'currency',
    label: 'cost_price',
  },
  sellPrice: {
    type: 'currency',
    label: 'sell_price',
  },
  sourceType: {
    type: 'string',
    label: 'source_type',
  },
  sourceId: {
    type: 'number',
    label: 'source_id',
  },
  notes: {
    type: 'textarea',
    label: 'notes',
    disableForTable: true,
  },
};

const StockLedgerModule = () => {
  const translate = useLanguage();
  const entity = 'stockledger';

  const Labels = {
    PANEL_TITLE: translate('stock_ledger'),
    DATATABLE_TITLE: translate('stock_ledger'),
    ADD_NEW_ENTITY: translate('add_new_stock_entry'),
    ENTITY_NAME: translate('stock_ledger'),
  };

  const searchConfig = {
    displayLabels: ['sourceType'],
    searchFields: 'sourceType,notes',
    outputValue: 'id',
  };

  const deleteModalLabels = ['product.name', 'sourceType'];

  const config = {
    entity,
    service: stockLedgerService,
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

export default StockLedgerModule;
