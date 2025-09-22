import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import useLanguage from '@/locale/useLanguage';
import expenseCategoryService from '@/services/expenseCategoryService';

const fields = {
  name: {
    type: 'string',
    required: true,
    label: 'name',
  },
  description: {
    type: 'textarea',
    label: 'description',
    disableForTable: true,
  },
};

const ExpenseCategoryModule = () => {
  const translate = useLanguage();
  const entity = 'expensecategory';

  const Labels = {
    PANEL_TITLE: translate('expense_category'),
    DATATABLE_TITLE: translate('expense_category_list'),
    ADD_NEW_ENTITY: translate('add_new_expense_category'),
    ENTITY_NAME: translate('expense_category'),
  };

  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
    outputValue: 'id',
  };

  const deleteModalLabels = ['name'];

  const config = {
    entity,
    service: expenseCategoryService,
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

export default ExpenseCategoryModule;
