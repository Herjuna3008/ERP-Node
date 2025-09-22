import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function StockLedger() {
  const translate = useLanguage();
  const entity = 'stockledger';

  const searchConfig = {
    displayLabels: ['notes'],
    searchFields: 'notes',
  };
  const deleteModalLabels = ['product.name', 'entryType'];

  const Labels = {
    PANEL_TITLE: translate('stock_ledger'),
    DATATABLE_TITLE: translate('stock_ledger'),
    ADD_NEW_ENTITY: translate('add_new_stock_ledger_entry'),
    ENTITY_NAME: translate('stock_ledger'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm />}
      config={config}
    />
  );
}
