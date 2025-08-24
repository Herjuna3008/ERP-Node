import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Card, Table } from 'antd';
import { Link } from 'react-router-dom';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';
import { PayrollDataTableModule } from '@/modules/PayrollModule';
import { request } from '@/request';

export default function Payroll() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'payroll';
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    request.summary({ entity }).then((res) => {
      if (res?.result) {
        setSummary(res.result);
      }
    });
  }, []);

  const dataTableColumns = [
    { title: translate('ID'), dataIndex: 'id' },
    { title: translate('Employee'), dataIndex: 'employee' },
    { title: translate('Amount'), dataIndex: 'amount' },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => dayjs(date).format(dateFormat),
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('payroll'),
    DATATABLE_TITLE: translate('payroll_list'),
    ADD_NEW_ENTITY: translate('add_new_payroll'),
    ENTITY_NAME: translate('payroll'),
  };

  const config = { entity, ...Labels, dataTableColumns };

  return (
    <>
      {summary.length > 0 && (
        <Card
          title={translate('Total') + ' ' + translate('payroll')}
          extra={<Link to="/expense">{translate('expense')}</Link>}
          style={{ marginBottom: 20 }}
        >
          <Table
            rowKey="month"
            pagination={false}
            dataSource={summary}
            columns={[
              {
                title: translate('Month'),
                dataIndex: 'month',
                render: (m) => dayjs(m).format('MMMM YYYY'),
              },
              { title: translate('Total'), dataIndex: 'total' },
            ]}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}
      <PayrollDataTableModule config={config} />
    </>
  );
}
