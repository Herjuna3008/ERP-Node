import dayjs from 'dayjs';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';
import { PurchaseDataTableModule } from '@/modules/PurchaseModule';
import { useEffect, useState } from 'react';
import { request } from '@/request';

export default function Purchase() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState({ start: '', end: '' });

  const fetchSummary = () => {
    request
      .summary({ entity: 'purchase', options: { startDate: period.start, endDate: period.end } })
      .then((res) => setSummary(res.result));
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const dataTableColumns = [
    { title: translate('ID'), dataIndex: 'id' },
    { title: translate('Supplier'), dataIndex: ['supplier', 'name'] },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => dayjs(date).format(dateFormat),
    },
    { title: translate('Total'), dataIndex: 'total' },
  ];

  const Labels = {
    PANEL_TITLE: translate('purchase'),
    DATATABLE_TITLE: translate('purchase_list'),
    ADD_NEW_ENTITY: translate('add_new_purchase'),
    ENTITY_NAME: translate('purchase'),
  };

  const entity = 'purchase';
  const config = { entity, ...Labels, dataTableColumns };

  return (
    <div>
      <div className="whiteBox shadow" style={{ padding: '15px', marginBottom: '20px' }}>
        <div>
          <label>{translate('Start Date')}</label>
          <input
            type="date"
            value={period.start}
            onChange={(e) => setPeriod({ ...period, start: e.target.value })}
          />
          <label style={{ marginLeft: '10px' }}>{translate('End Date')}</label>
          <input
            type="date"
            value={period.end}
            onChange={(e) => setPeriod({ ...period, end: e.target.value })}
          />
          <button style={{ marginLeft: '10px' }} onClick={fetchSummary}>
            {translate('Load')}
          </button>
        </div>
        {summary && (
          <div style={{ marginTop: '10px' }}>
            <strong>{translate('Total')}:</strong> {summary.total} |{' '}
            <strong>{translate('Count')}:</strong> {summary.count}
          </div>
        )}
      </div>
      <PurchaseDataTableModule config={config} />
    </div>
  );
}
