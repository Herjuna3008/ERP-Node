import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import stockToBuyService from '@/services/stockToBuyService';

const StockToBuyModule = () => {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const entity = stockToBuyService.entity;
  const navigate = useNavigate();

  const handleRecordPurchase = () => {
    navigate('/purchaseinvoice');
  };

  const dataTableColumns = [
    {
      title: translate('product'),
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
      title: translate('quantity'),
      dataIndex: 'quantity',
    },
    {
      title: translate('cost_price'),
      dataIndex: 'lastCostPrice',
      render: (value, record) =>
        moneyFormatter({ amount: value || 0, currency_code: record?.currency || 'NA' }),
    },
    {
      title: translate('sell_price'),
      dataIndex: 'lastSellPrice',
      render: (value, record) =>
        moneyFormatter({ amount: value || 0, currency_code: record?.currency || 'NA' }),
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

  const config = {
    entity,
    service: stockToBuyService,
    dataTableColumns,
    disableAdd: true,
    disableActions: true,
    disableDelete: true,
    searchConfig: { entity: 'product' },
    PANEL_TITLE: translate('stock_to_buy'),
    DATATABLE_TITLE: translate('stock_to_buy'),
    ADD_NEW_ENTITY: translate('stock_to_buy'),
    ENTITY_NAME: translate('stock_to_buy'),
    deleteModalLabels: ['productName'],
  };

  return (
    <ErpLayout>
      <ErpPanel config={config} />
    </ErpLayout>
  );
};

export default StockToBuyModule;
