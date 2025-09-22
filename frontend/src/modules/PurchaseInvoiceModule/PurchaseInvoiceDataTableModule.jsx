import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import dayjs from 'dayjs';

export default function PurchaseInvoiceDataTableModule({ config }) {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

  const dataTableColumns = [
    {
      title: translate('Number'),
      dataIndex: 'number',
      render: (number, record) => `${number}/${record.year}`,
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
      title: translate('Due date'),
      dataIndex: 'dueDate',
      render: (value) => (value ? dayjs(value).format(dateFormat) : ''),
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
      render: (total, record) => moneyFormatter({ amount: total, currency_code: record.currency }),
    },
    {
      title: translate('status'),
      dataIndex: 'status',
    },
  ];

  return (
    <ErpLayout>
      <ErpPanel config={{ ...config, dataTableColumns, allowedActions: ['delete'] }} />
    </ErpLayout>
  );
}
