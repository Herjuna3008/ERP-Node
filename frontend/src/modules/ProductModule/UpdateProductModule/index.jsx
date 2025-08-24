import { ErpLayout } from '@/layout';
import UpdateItem from '@/modules/ErpPanelModule/UpdateItem';
import ProductForm from '../ProductForm';

export default function UpdateProductModule({ config }) {
  return (
    <ErpLayout>
      <UpdateItem config={config} UpdateForm={ProductForm} />
    </ErpLayout>
  );
}
