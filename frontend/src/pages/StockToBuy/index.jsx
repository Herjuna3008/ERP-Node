import { useCallback, useEffect, useState } from 'react';

import { PageHeader } from '@ant-design/pro-layout';
import { Button, Table } from 'antd';
import { RedoOutlined } from '@ant-design/icons';

import { ErpLayout } from '@/layout';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';

export default function StockToBuy() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request.get({ entity: 'purchaseinvoice/stock-to-buy' });
      if (response?.success) {
        setDataSource(response.result || []);
      } else {
        setDataSource([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    {
      title: translate('product'),
      dataIndex: 'productName',
    },
    {
      title: translate('quantity'),
      dataIndex: 'quantity',
    },
    {
      title: translate('last_cost_price'),
      dataIndex: 'lastCostPrice',
      render: (value) => moneyFormatter({ amount: value }),
    },
    {
      title: translate('last_sell_price'),
      dataIndex: 'lastSellPrice',
      render: (value) => moneyFormatter({ amount: value }),
    },
  ];

  return (
    <ErpLayout>
      <PageHeader
        title={translate('stock_to_buy')}
        ghost={false}
        extra={[
          <Button key="refresh" icon={<RedoOutlined />} onClick={fetchData} loading={loading}>
            {translate('Refresh')}
          </Button>,
        ]}
      />
      <Table
        rowKey={(record) => record.productId}
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    </ErpLayout>
  );
}
