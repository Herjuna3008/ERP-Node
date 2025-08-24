import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import { useSelector } from 'react-redux';
import { selectListItems } from '@/redux/erp/selectors';
import useLanguage from '@/locale/useLanguage';

export default function ExpenseDataTableModule({ config }) {
  const translate = useLanguage();
  const { result } = useSelector(selectListItems);
  const total = result?.items?.reduce((sum, item) => sum + item.amount, 0) || 0;

  return (
    <ErpLayout>
      <div style={{ marginBottom: 16 }}>{`${translate('total')}: ${total}`}</div>
      <ErpPanel config={config}></ErpPanel>
    </ErpLayout>
  );
}
