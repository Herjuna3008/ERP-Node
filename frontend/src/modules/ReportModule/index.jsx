import { useEffect, useState } from 'react';
import { Card, Table } from 'antd';
import useLanguage from '@/locale/useLanguage';
import api from '@/services/api';

export default function ReportModule() {
  const translate = useLanguage();
  const [summary, setSummary] = useState(null);
  const [aging, setAging] = useState(null);

  useEffect(() => {
    api.get({ entity: '/reports/summary' }).then((res) => setSummary(res));
    api.get({ entity: '/reports/ar-aging' }).then((res) => setAging(res));
  }, []);

  const agingData = aging
    ? Object.keys(aging).map((key) => ({ bucket: key, amount: aging[key] }))
    : [];

  return (
    <div className="whiteBox shadow pad20" style={{ width: '100%' }}>
      <h3 style={{ marginBottom: 20 }}>{translate('Reports')}</h3>
      {summary && (
        <Card title={translate('Summary')} style={{ marginBottom: 20 }}>
          <pre>{JSON.stringify(summary, null, 2)}</pre>
        </Card>
      )}
      {aging && (
        <Card title={translate('AR Aging')}>
          <Table
            rowKey="bucket"
            pagination={false}
            dataSource={agingData}
            columns={[
              { title: translate('Bucket'), dataIndex: 'bucket' },
              { title: translate('Amount'), dataIndex: 'amount' },
            ]}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}
    </div>
  );
}
