import { ErpLayout } from '@/layout';

import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectItemById, selectCurrentItem } from '@/redux/erp/selectors';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Payment from './components/Payment';

export default function RecordPaymentModule({ config }) {
  const dispatch = useDispatch();
  const { id } = useParams();

  let item = useSelector(selectItemById(id));
  const { result: currentResult } = useSelector(selectCurrentItem);
  item = item || currentResult;

  useEffect(() => {
    if (!item) {
      dispatch(erp.read({ entity: config.entity, id }));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (item) {
      dispatch(erp.currentItem({ data: item }));
      dispatch(erp.currentAction({ actionType: 'recordPayment', data: item }));
    }
  }, [dispatch, item]);

  return (
    <ErpLayout>
      {item ? <Payment config={config} currentItem={item} /> : <PageLoader />}
    </ErpLayout>
  );
}
