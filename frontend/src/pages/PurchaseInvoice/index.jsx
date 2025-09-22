import useLanguage from '@/locale/useLanguage';
import PurchaseInvoiceDataTableModule from '@/modules/PurchaseInvoiceModule/PurchaseInvoiceDataTableModule';

export default function PurchaseInvoice() {
  const translate = useLanguage();
  const entity = 'purchaseinvoice';

  const config = {
    entity,
    PANEL_TITLE: translate('purchase_invoices'),
    DATATABLE_TITLE: translate('purchase_invoice_list'),
    ADD_NEW_ENTITY: translate('add_new_purchase_invoice'),
    ENTITY_NAME: translate('purchase_invoice'),
  };

  return <PurchaseInvoiceDataTableModule config={config} />;
}
