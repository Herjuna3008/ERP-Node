import useLanguage from '@/locale/useLanguage';
import { UpdateProductModule } from '@/modules/ProductModule';

export default function ProductUpdate() {
  const translate = useLanguage();
  const entity = 'products';

  const Labels = {
    PANEL_TITLE: translate('product'),
    DATATABLE_TITLE: translate('product_list'),
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
  };

  const config = { entity, ...Labels };

  return <UpdateProductModule config={config} />;
}
