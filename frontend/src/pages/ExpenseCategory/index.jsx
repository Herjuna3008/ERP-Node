import React from 'react';
import useLanguage from '@/locale/useLanguage';
import ExpenseCategoryModule from '@/modules/ExpenseCategoryModule';

export default function ExpenseCategory() {
  const translate = useLanguage();
  const entity = 'expensecategory';

  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
    outputValue: 'id',
  };

  const dataTableColumns = [
    {
      title: translate('name'),
      dataIndex: 'name',
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('expense_category'),
    DATATABLE_TITLE: translate('expense_category_list'),
    ADD_NEW_ENTITY: translate('add_new_expense_category'),
    ENTITY_NAME: translate('expense_category'),
  };

  const config = {
    entity,
    ...Labels,
    dataTableColumns,
    readColumns: dataTableColumns,
    searchConfig,
    deleteModalLabels: ['name'],
  };

  return <ExpenseCategoryModule config={config} />;
}
