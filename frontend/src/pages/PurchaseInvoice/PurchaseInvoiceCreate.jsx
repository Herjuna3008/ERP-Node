import useLanguage from '@/locale/useLanguage';
import CreatePurchaseInvoiceModule from '@/modules/PurchaseInvoiceModule/CreatePurchaseInvoiceModule';

export default function PurchaseInvoiceCreate() {
  const translate = useLanguage();
  const entity = 'purchaseinvoice';

  const config = {
    entity,
    PANEL_TITLE: translate('purchase_invoice'),
    ADD_NEW_ENTITY: translate('add_new_purchase_invoice'),
    ENTITY_NAME: translate('purchase_invoice'),
  };

  return <CreatePurchaseInvoiceModule config={config} />;
}
