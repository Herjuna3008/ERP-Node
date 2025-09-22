import { useEffect } from 'react';
import { Card, Table, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import useOnFetch from '@/hooks/useOnFetch';
import { request } from '@/request';
import { useMoney } from '@/settings';

export default function StockToBuyModule() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { result, isLoading, onFetch } = useOnFetch();

  useEffect(() => {
    onFetch(request.get({ entity: 'purchaseinvoice/stock-to-buy' }));
  }, []);

  const handleReload = () => {
    onFetch(request.get({ entity: 'purchaseinvoice/stock-to-buy' }));
  };

  const columns = [
    {
      title: translate('Product'),
      dataIndex: 'productName',
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
    },
    {
      title: translate('Last cost price'),
      dataIndex: 'lastCostPrice',
      render: (value) => moneyFormatter({ amount: value }),
    },
    {
      title: translate('Last sell price'),
      dataIndex: 'lastSellPrice',
      render: (value) => moneyFormatter({ amount: value }),
    },
  ];

  return (
    <ErpLayout>
      <Card
        title={translate('stock_to_buy')}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReload}>
              {translate('Refresh')}
            </Button>
          </Space>
        }
      >
        <Table
          rowKey={(item) => item.productId}
          columns={columns}
          loading={isLoading}
          dataSource={result || []}
          pagination={false}
          scroll={{ x: true }}
        />
      </Card>
    </ErpLayout>
  );
}
