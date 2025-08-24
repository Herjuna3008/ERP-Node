import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import DeliveryNoteForm from '@/modules/DeliveryNoteModule/Forms/DeliveryNoteForm';

export default function CreateDeliveryNoteModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={DeliveryNoteForm} />
    </ErpLayout>
  );
}
