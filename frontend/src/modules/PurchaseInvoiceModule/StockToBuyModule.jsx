import { useEffect } from 'react';
import { Card, Table, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import useOnFetch from '@/hooks/useOnFetch';
import { request } from '@/request';
import { useMoney } from '@/settings';

export default function StockToBuyModule() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { result, isLoading, onFetch } = useOnFetch();
  const navigate = useNavigate();

  useEffect(() => {
    onFetch(request.get({ entity: 'purchaseinvoice/stock-to-buy' }));
  }, []);

  const handleReload = () => {
    onFetch(request.get({ entity: 'purchaseinvoice/stock-to-buy' }));
  };

  const handleRecordPurchase = () => {
    navigate('/purchaseinvoice');
  };

  const columns = [
    {
      title: translate('Product'),
      dataIndex: 'productName',
    },
    {
      title: translate('client'),
      dataIndex: 'clients',
      render: (clients) => {
        const names = Array.isArray(clients) ? clients.filter(Boolean) : [];
        return names.length ? names.join(', ') : translate('none');
      },
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
    {
      title: '',
      dataIndex: 'actions',
      key: 'actions',
      align: 'right',
      render: () => (
        <Button type="primary" onClick={handleRecordPurchase}>
          {translate('record_purchase')}
        </Button>
      ),
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
