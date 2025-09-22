import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import stockToBuyService from '@/services/stockToBuyService';

const StockToBuyModule = () => {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const entity = stockToBuyService.entity;

  const dataTableColumns = [
    {
      title: translate('product'),
      dataIndex: 'productName',
    },
    {
      title: translate('quantity'),
      dataIndex: 'quantity',
    },
    {
      title: translate('cost_price'),
      dataIndex: 'lastCostPrice',
      render: (value) => moneyFormatter({ amount: value || 0, currency_code: 'NA' }),
    },
    {
      title: translate('sell_price'),
      dataIndex: 'lastSellPrice',
      render: (value) => moneyFormatter({ amount: value || 0, currency_code: 'NA' }),
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
