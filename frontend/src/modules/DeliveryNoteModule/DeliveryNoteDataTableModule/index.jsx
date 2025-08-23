import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { CheckOutlined, FileAddOutlined } from '@ant-design/icons';

export default function DeliveryNoteDataTableModule({ config }) {
  const translate = useLanguage();
  return (
    <ErpLayout>
      <ErpPanel
        config={config}
        extra={[
          { label: translate('Post'), key: 'post', icon: <CheckOutlined /> },
          {
            label: translate('Generate Invoice'),
            key: 'generateInvoice',
            icon: <FileAddOutlined />,
          },
        ]}
      ></ErpPanel>
    </ErpLayout>
  );
}
