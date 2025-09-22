import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function Expense() {
  const translate = useLanguage();
  const entity = 'expense';

  const searchConfig = {
    displayLabels: ['description', 'reference'],
    searchFields: 'description,reference',
  };
  const deleteModalLabels = ['description', 'reference'];

  const Labels = {
    PANEL_TITLE: translate('expense'),
    DATATABLE_TITLE: translate('expense_list'),
    ADD_NEW_ENTITY: translate('add_new_expense'),
    ENTITY_NAME: translate('expense'),
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
