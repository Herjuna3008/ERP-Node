import { useEffect, useMemo, useState } from 'react';
import { Form, Divider, Button, Tag } from 'antd';
import dayjs from 'dayjs';
import { ArrowLeftOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';
import { ErpLayout } from '@/layout';
import PurchaseInvoiceForm from '@/modules/PurchaseInvoiceModule/Forms/PurchaseInvoiceForm';
import { erp } from '@/redux/erp/actions';
import { selectCreatedItem } from '@/redux/erp/selectors';
import calculate from '@/utils/calculate';
import Loading from '@/components/Loading';

const DEFAULT_TOTALS = {
  subTotal: 0,
  discountedSubTotal: 0,
  globalDiscountAmount: 0,
  taxTotal: 0,
  total: 0,
};

const computeTotals = (values = {}) => {
  const items = values.items || [];
  const taxRate = Number(values.taxRate || 0);
  const globalDiscountValue = Number(values.globalDiscountValue || 0);
  const globalDiscountType = values.globalDiscountType || 'amount';

  let subTotal = 0;
  let discountedSubTotal = 0;

  items.forEach((item) => {
    if (!item) return;
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const discountValue = Number(item.discountValue || 0);
    const discountType = item.discountType || 'amount';

    const lineGross = calculate.multiply(unitPrice, quantity);
    const lineDiscount =
      discountType === 'percent'
        ? calculate.multiply(unitPrice, discountValue / 100)
        : discountValue;
    const netUnit = Math.max(calculate.sub(unitPrice, lineDiscount), 0);
    const lineNet = calculate.multiply(netUnit, quantity);

    subTotal = calculate.add(subTotal, lineGross);
    discountedSubTotal = calculate.add(discountedSubTotal, lineNet);
  });

  let globalDiscountAmount = 0;
  if (globalDiscountType === 'percent') {
    globalDiscountAmount = calculate.multiply(discountedSubTotal, globalDiscountValue / 100);
  } else {
    globalDiscountAmount = globalDiscountValue;
  }

  const discountedAfterGlobal = Math.max(
    calculate.sub(discountedSubTotal, globalDiscountAmount),
    0
  );
  const taxTotal = calculate.multiply(discountedAfterGlobal, taxRate / 100);
  const total = calculate.add(discountedAfterGlobal, taxTotal);

  return {
    subTotal,
    discountedSubTotal,
    globalDiscountAmount,
    taxTotal,
    total,
  };
};

export default function CreatePurchaseInvoiceModule({ config }) {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { entity } = config;

  const [form] = Form.useForm();
  const [totals, setTotals] = useState(DEFAULT_TOTALS);

  const { isLoading, isSuccess } = useSelector(selectCreatedItem);

  useEffect(() => {
    form.setFieldsValue({
      items: [{ quantity: 1, unitPrice: 0, discountValue: 0, discountType: 'amount' }],
      date: dayjs(),
      dueDate: dayjs().add(30, 'days'),
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
      taxRate: 0,
      globalDiscountValue: 0,
      globalDiscountType: 'amount',
    });
    setTotals(computeTotals(form.getFieldsValue()));
  }, []);

  useEffect(() => {
    if (isSuccess) {
      const values = form.getFieldsValue();
      form.resetFields();
      form.setFieldsValue({
        ...values,
        items: [{ quantity: 1, unitPrice: 0, discountValue: 0, discountType: 'amount' }],
        date: dayjs(),
        dueDate: dayjs().add(30, 'days'),
      });
      setTotals(DEFAULT_TOTALS);
      dispatch(erp.resetAction({ actionType: 'create' }));
      navigate(`/${entity}`);
    }
  }, [isSuccess]);

  const onValuesChange = (_, values) => {
    setTotals(computeTotals(values));
  };

  const handleSubmit = (values) => {
    const payload = { ...values };

    if (values.date) {
      payload.date = dayjs(values.date).format('YYYY-MM-DD');
    }
    if (values.dueDate) {
      payload.dueDate = dayjs(values.dueDate).format('YYYY-MM-DD');
    }

    payload.items = (values.items || []).map((item) => ({
      product: item.product,
      description: item.description,
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.unitPrice || 0),
      discountValue: Number(item.discountValue || 0),
      discountType: item.discountType || 'amount',
    }));

    payload.taxRate = Number(values.taxRate || 0);
    payload.globalDiscountValue = Number(values.globalDiscountValue || 0);
    payload.globalDiscountType = values.globalDiscountType || 'amount';

    dispatch(erp.create({ entity, jsonData: payload }));
  };

  const extraActions = useMemo(
    () => [
      <Button
        key="cancel"
        onClick={() => navigate(`/${entity}`)}
        icon={<CloseCircleOutlined />}
      >
        {translate('Cancel')}
      </Button>,
      <Button key="save" type="primary" icon={<PlusOutlined />} onClick={() => form.submit()}>
        {translate('Save')}
      </Button>,
    ],
    [form, navigate, entity, translate]
  );

  return (
    <ErpLayout>
      <PageHeader
        onBack={() => navigate(`/${entity}`)}
        backIcon={<ArrowLeftOutlined />}
        title={translate('New')}
        ghost={false}
        tags={<Tag>{translate('Draft')}</Tag>}
        extra={extraActions}
        style={{ padding: '20px 0px' }}
      />
      <Divider dashed />
      <Loading isLoading={isLoading}>
        <Form
          layout="vertical"
          form={form}
          onValuesChange={onValuesChange}
          onFinish={handleSubmit}
        >
          <PurchaseInvoiceForm totals={totals} />
        </Form>
      </Loading>
    </ErpLayout>
  );
}
