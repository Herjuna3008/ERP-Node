import dayjs from 'dayjs';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';
import { Tabs } from 'antd';
import { ExpenseDataTableModule, CreateExpenseModule } from '@/modules/ExpenseModule';

export default function Expense() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'expense';

  const searchConfig = {
    entity: 'expensecategory',
    displayLabels: ['name'],
    searchFields: 'name',
    outputValue: 'id',
  };

  const dataTableColumns = [
    { title: translate('ID'), dataIndex: 'id' },
    { title: translate('Amount'), dataIndex: 'amount' },
    { title: translate('expense_category'), dataIndex: ['category', 'name'] },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => dayjs(date).format(dateFormat),
    },
    { title: translate('Description'), dataIndex: 'description' },
  ];

  const Labels = {
    PANEL_TITLE: translate('expense'),
    DATATABLE_TITLE: translate('expense_list'),
    ADD_NEW_ENTITY: translate('add_new_expense'),
    ENTITY_NAME: translate('expense'),
  };

  const config = { entity, ...Labels, dataTableColumns, searchConfig };

  const items = [
    {
      key: 'list',
      label: translate('expense_list'),
      children: <ExpenseDataTableModule config={config} />,
    },
    {
      key: 'create',
      label: translate('add_new_expense'),
      children: <CreateExpenseModule />,
    },
  ];

  return <Tabs items={items} />;
}
