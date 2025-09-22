import dayjs from 'dayjs';

import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';

export default function PurchaseInvoice() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const entity = 'purchaseinvoice';

  const searchConfig = {
    displayLabels: ['number'],
    searchFields: 'number',
  };
  const deleteModalLabels = ['number'];

  const dataTableColumns = [
    {
      title: translate('Number'),
      dataIndex: 'number',
    },
    {
      title: translate('Supplier'),
      dataIndex: ['supplier', 'name'],
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (value) => (value ? dayjs(value).format(dateFormat) : ''),
    },
    {
      title: translate('due_date'),
      dataIndex: 'dueDate',
      render: (value) => (value ? dayjs(value).format(dateFormat) : ''),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      render: (value) => translate(value),
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      onCell: () => ({
        style: {
          textAlign: 'right',
          whiteSpace: 'nowrap',
          direction: 'ltr',
        },
      }),
      render: (amount, record) => moneyFormatter({ amount, currency_code: record.currency }),
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('purchase_invoice'),
    DATATABLE_TITLE: translate('purchase_invoice_list'),
    ADD_NEW_ENTITY: translate('add_new_purchase_invoice'),
    ENTITY_NAME: translate('purchase_invoice'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    fields,
    dataTableColumns,
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
