import { ErpLayout } from '@/layout';
import ReadItem from './components/ReadItem';

import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectItemById, selectCurrentItem } from '@/redux/erp/selectors';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

export default function ReadPaymentModule({ config }) {
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
    }
  }, [dispatch, item]);

  return (
    <ErpLayout>
      {item ? <ReadItem config={config} selectedItem={item} /> : <PageLoader />}
    </ErpLayout>
  );
}
