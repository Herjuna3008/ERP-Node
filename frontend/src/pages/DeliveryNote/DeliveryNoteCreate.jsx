import useLanguage from '@/locale/useLanguage';
import CreateDeliveryNoteModule from '@/modules/DeliveryNoteModule/CreateDeliveryNoteModule';

export default function DeliveryNoteCreate() {
  const translate = useLanguage();
  const entity = 'deliverynote';

  const Labels = {
    PANEL_TITLE: translate('deliverynote'),
    DATATABLE_TITLE: translate('deliverynote_list'),
    ADD_NEW_ENTITY: translate('add_new_deliverynote'),
    ENTITY_NAME: translate('deliverynote'),
  };

  const configPage = { entity, ...Labels };
  return <CreateDeliveryNoteModule config={configPage} />;
}
