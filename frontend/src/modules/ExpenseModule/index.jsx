import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import useLanguage from '@/locale/useLanguage';
import expenseService from '@/services/expenseService';

const fields = {
  expenseDate: {
    type: 'date',
    label: 'expense_date',
    required: true,
  },
  amount: {
    type: 'currency',
    label: 'amount',
    required: true,
  },
  category: {
    type: 'async',
    label: 'expense_category',
    entity: 'expensecategory',
    displayLabels: ['name'],
    outputValue: 'id',
    dataIndex: ['category', 'name'],
  },
  supplier: {
    type: 'async',
    label: 'supplier',
    entity: 'supplier',
    displayLabels: ['name'],
    outputValue: 'id',
    dataIndex: ['supplier', 'name'],
  },
  reference: {
    type: 'string',
    label: 'reference',
  },
  description: {
    type: 'textarea',
    label: 'description',
    disableForTable: true,
  },
};

const ExpenseModule = () => {
  const translate = useLanguage();
  const entity = 'expense';

  const Labels = {
    PANEL_TITLE: translate('expense'),
    DATATABLE_TITLE: translate('expense_list'),
    ADD_NEW_ENTITY: translate('add_new_expense'),
    ENTITY_NAME: translate('expense'),
  };

  const searchConfig = {
    displayLabels: ['reference'],
    searchFields: 'reference,description',
    outputValue: 'id',
  };

  const deleteModalLabels = ['reference', 'amount'];

  const config = {
    entity,
    service: expenseService,
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

export default ExpenseModule;
