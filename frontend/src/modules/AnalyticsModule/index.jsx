import { useEffect, useState } from 'react';
import { Card } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';

export default function AnalyticsModule() {
  const translate = useLanguage();
  const [data, setData] = useState(null);

  useEffect(() => {
    request.get({ entity: '/reports/analytics' }).then((res) => setData(res));
  }, []);

  return (
    <Card className="whiteBox shadow pad20" title={translate('Analytics')}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Card>
  );
}
