import dayjs from 'dayjs';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';
import DeliveryNoteDataTableModule from '@/modules/DeliveryNoteModule/DeliveryNoteDataTableModule';

export default function DeliveryNote() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'deliverynote';

  const dataTableColumns = [
    { title: translate('ID'), dataIndex: 'id' },
    { title: translate('Client'), dataIndex: ['client', 'name'] },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => dayjs(date).format(dateFormat),
    },
    { title: translate('Status'), dataIndex: 'status' },
  ];

  const Labels = {
    PANEL_TITLE: translate('deliverynote'),
    DATATABLE_TITLE: translate('deliverynote_list'),
    ADD_NEW_ENTITY: translate('add_new_deliverynote'),
    ENTITY_NAME: translate('deliverynote'),
  };

  const config = { entity, ...Labels, dataTableColumns };

  return <DeliveryNoteDataTableModule config={config} />;
}
