import { ErpLayout } from '@/layout';
import { PageHeader } from '@ant-design/pro-layout';
import { Tag, Button, Form, Divider, InputNumber } from 'antd';
import { ArrowLeftOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PurchaseForm from '../PurchaseForm';
import useLanguage from '@/locale/useLanguage';
import calculate from '@/utils/calculate';
import { useState } from 'react';
import { request } from '@/request';

export default function CreatePurchaseModule({ config }) {
  const translate = useLanguage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [subTotal, setSubTotal] = useState(0);
  const entity = config?.entity || 'purchase';

  const onFinish = async (values) => {
    const payload = {
      supplier: values.supplier,
      date: values.date,
      notes: values.notes,
      items: values.items?.map((i) => ({ product: i.product, quantity: i.quantity, cost: i.cost })),
    };
    try {
      await request.post({ entity: 'purchases', jsonData: payload });
      window.dispatchEvent(new Event('stockUpdate'));
      navigate(`/${entity}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleValuesChange = (_, values) => {
    const items = values.items || [];
    let total = 0;
    items.forEach((item, idx) => {
      if (item && item.quantity != null && item.cost != null) {
        const line = calculate.multiply(item.quantity, item.cost);
        total = calculate.add(total, line);
        form.setFields([{ name: ['items', idx, 'total'], value: line }]);
      }
    });
    setSubTotal(total);
  };

  return (
    <ErpLayout>
      <PageHeader
        onBack={() => navigate(`/${entity}`)}
        backIcon={<ArrowLeftOutlined />}
        title={translate('New')}
        ghost={false}
        tags={<Tag>{translate('Draft')}</Tag>}
        extra={[
          <Button key="cancel" onClick={() => navigate(`/${entity}`)} icon={<CloseCircleOutlined />}>
            {translate('Cancel')}
          </Button>,
          <Button key="save" type="primary" icon={<PlusOutlined />} onClick={() => form.submit()}>
            {translate('Save')}
          </Button>,
        ]}
        style={{ padding: '20px 0px' }}
      />
      <Divider dashed />
      <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={handleValuesChange}>
        <PurchaseForm />
        <Divider dashed />
        <div style={{ position: 'relative', width: '100%', float: 'right' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ paddingRight: '12px' }}>{translate('Sub Total')} :</div>
            <Form.Item>
              <InputNumber readOnly value={subTotal} style={{ width: '150px' }} />
            </Form.Item>
          </div>
        </div>
      </Form>
    </ErpLayout>
  );
}

