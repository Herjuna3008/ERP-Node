import NotFound from '@/components/NotFound';
import { ErpLayout } from '@/layout';
import ReadItem from '@/modules/ErpPanelModule/ReadItem';

import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import request from '@/request/request';

import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

export default function ReadQuoteModule({ config }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const handleConvert = async () => {
    const data = await request.convert({ entity: 'quotes', id });
    if (data.success) {
      navigate(`/invoice/read/${data.result.id}`);
    }
  };

  useLayoutEffect(() => {
    dispatch(erp.read({ entity: config.entity, id }));
  }, [id]);

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  } else
    return (
      <ErpLayout>
        {isSuccess ? (
          <ReadItem config={config} selectedItem={currentResult} onConvert={handleConvert} />
        ) : (
          <NotFound entity={config.entity} />
        )}
      </ErpLayout>
    );
}
