import { useState, useEffect } from 'react';
import { Form, Divider } from 'antd';
import dayjs from 'dayjs';
import { Button, Tag } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';

import calculate from '@/utils/calculate';
import { generate as uniqueId } from 'shortid';
import { selectUpdatedItem } from '@/redux/erp/selectors';
import Loading from '@/components/Loading';

import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import { settingsAction } from '@/redux/settings/actions';
// import { StatusTag } from '@/components/Tag';
import { computeItemTotals, computeInvoiceTotals } from '@/utils/invoiceCalculations';

function SaveForm({ form, translate }) {
  const handelClick = () => {
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" icon={<PlusOutlined />}>
      {translate('update')}
    </Button>
  );
}

export default function UpdateItem({ config, UpdateForm }) {
  const translate = useLanguage();
  let { entity } = config;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, isLoading, isSuccess } = useSelector(selectUpdatedItem);
  const [form] = Form.useForm();
  const [subTotal, setSubTotal] = useState(0);

  const resetErp = {
    status: '',
    client: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    subTotal: 0,
    taxTotal: 0,
    taxRate: 0,
    total: 0,
    credit: 0,
    number: 0,
    year: 0,
  };

  const [currentErp, setCurrentErp] = useState(current ?? resetErp);

  const { id } = useParams();

  const handelValuesChange = (changedValues, values) => {
    const items = values['items'];
    let subTotal = 0;

    if (items) {
      items.map((item) => {
        if (item) {
          const { total } = computeItemTotals(item);
          subTotal = calculate.add(subTotal, total);
        }
      });
      setSubTotal(subTotal);
    }
  };

  const onSubmit = (fieldsValue) => {
    let dataToUpdate = { ...fieldsValue };
    if (!fieldsValue) {
      return;
    }
    if (fieldsValue.date || fieldsValue.expiredDate || fieldsValue.dueDate) {
      if (fieldsValue.date) {
        dataToUpdate.date = dayjs(fieldsValue.date).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      if (fieldsValue.expiredDate) {
        dataToUpdate.expiredDate = dayjs(fieldsValue.expiredDate).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      if (fieldsValue.dueDate) {
        dataToUpdate.dueDate = dayjs(fieldsValue.dueDate).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
    }

    const taxValue = Number(fieldsValue.taxRate || 0);
    const { items = [] } = fieldsValue;
    const { items: normalizedItems, subTotal, discountAmount, taxTotal, total } = computeInvoiceTotals({
      items,
      globalDiscountType: fieldsValue.globalDiscountType,
      globalDiscountValue: fieldsValue.globalDiscountValue,
      taxRate: taxValue / 100,
    });

    dataToUpdate = {
      ...dataToUpdate,
      items: normalizedItems,
      subTotal,
      discount: discountAmount,
      taxTotal,
      total,
    };

    dispatch(erp.update({ entity, id, jsonData: dataToUpdate }));
  };
  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      setSubTotal(0);
      dispatch(erp.resetAction({ actionType: 'update' }));
      navigate(`/${entity.toLowerCase()}/read/${id}`);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (current) {
      setCurrentErp(current);
      let formData = { ...current };
      if (formData.date) {
        formData.date = dayjs(formData.date);
      }
      if (formData.expiredDate) {
        formData.expiredDate = dayjs(formData.expiredDate);
      }
      if (formData.dueDate) {
        formData.dueDate = dayjs(formData.dueDate);
      }
      if (!formData.taxRate) {
        formData.taxRate = 0;
      }

      const { subTotal } = formData;

      form.resetFields();
      form.setFieldsValue(formData);
      setSubTotal(subTotal);
    }
  }, [current]);

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        title={translate('update')}
        ghost={false}
        tags={[
          <span key="status">{currentErp.status && translate(currentErp.status)}</span>,
          currentErp.paymentStatus && (
            <span key="paymentStatus">
              {currentErp.paymentStatus && translate(currentErp.paymentStatus)}
            </span>
          ),
        ]}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              navigate(`/${entity.toLowerCase()}`);
            }}
            icon={<CloseCircleOutlined />}
          >
            {translate('Cancel')}
          </Button>,
          <SaveForm translate={translate} form={form} key={`${uniqueId()}`} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Divider dashed />
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit} onValuesChange={handelValuesChange}>
          <UpdateForm subTotal={subTotal} current={current} />
        </Form>
      </Loading>
    </>
  );
}
