import useLanguage from '@/locale/useLanguage';
import { ProductDataTableModule } from '@/modules/ProductModule';

export default function Product() {
  const translate = useLanguage();
  const entity = 'products';

  const dataTableColumns = [
    { title: translate('SKU'), dataIndex: 'sku' },
    { title: translate('Name'), dataIndex: 'name' },
    { title: translate('Price'), dataIndex: 'price' },
    { title: translate('Stock'), dataIndex: 'stock' },
    { title: translate('Min Stock'), dataIndex: 'minStock' },
    { title: translate('Average Cost'), dataIndex: 'averageCost' },
    { title: translate('Description'), dataIndex: 'description' },
  ];

  const Labels = {
    PANEL_TITLE: translate('product'),
    DATATABLE_TITLE: translate('product_list'),
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
  };

  const config = { entity, ...Labels, dataTableColumns };

  return <ProductDataTableModule config={config} />;
}
