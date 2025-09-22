import { Row, Col, Form, Input, InputNumber, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMemo } from 'react';

import SelectAsync from '@/components/SelectAsync';
import { useMoney } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import calculate from '@/utils/calculate';

const DISCOUNT_OPTIONS = [
  { value: 'amount', label: 'amount' },
  { value: 'percent', label: 'percent' },
];

export default function PurchaseItemRow({ field, remove }) {
  const translate = useLanguage();
  const money = useMoney();
  const form = Form.useFormInstance();

  const quantity = Form.useWatch([field.name, 'quantity'], form) ?? 0;
  const unitPrice = Form.useWatch([field.name, 'unitPrice'], form) ?? 0;
  const discountValue = Form.useWatch([field.name, 'discountValue'], form) ?? 0;
  const discountType = Form.useWatch([field.name, 'discountType'], form) ?? 'amount';

  const netUnitPrice = useMemo(() => {
    const discount =
      discountType === 'percent'
        ? calculate.multiply(unitPrice, discountValue / 100)
        : discountValue;
    const computed = calculate.sub(unitPrice, discount);
    return computed < 0 ? 0 : computed;
  }, [unitPrice, discountType, discountValue]);

  const lineTotal = useMemo(() => {
    return calculate.multiply(netUnitPrice, quantity);
  }, [netUnitPrice, quantity]);

  return (
    <Row gutter={[12, 12]} align="middle">
      <Col xs={24} md={6}>
        <Form.Item
          name={[field.name, 'product']}
          label={translate('Product')}
          rules={[{ required: true, message: translate('Product is required') }]}
        >
          <SelectAsync
            entity="product"
            displayLabels={['name']}
            outputValue="id"
            placeholder={translate('Select product')}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={6}>
        <Form.Item name={[field.name, 'description']} label={translate('Description')}>
          <Input placeholder={translate('Description')} />
        </Form.Item>
      </Col>
      <Col xs={12} md={3}>
        <Form.Item
          name={[field.name, 'quantity']}
          label={translate('Quantity')}
          rules={[{ required: true, message: translate('Quantity is required') }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col xs={12} md={3}>
        <Form.Item
          name={[field.name, 'unitPrice']}
          label={translate('Unit price')}
          rules={[{ required: true, message: translate('Unit price is required') }]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            className="moneyInput"
            controls={false}
            addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
            addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
          />
        </Form.Item>
      </Col>
      <Col xs={12} md={3}>
        <Form.Item name={[field.name, 'discountValue']} label={translate('Discount')} initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col xs={12} md={3}>
        <Form.Item name={[field.name, 'discountType']} label={translate('Type')} initialValue="amount">
          <Select
            options={DISCOUNT_OPTIONS.map((option) => ({
              value: option.value,
              label: translate(option.label),
            }))}
          />
        </Form.Item>
      </Col>
      <Col xs={12} md={4}>
        <div className="moneyInput" style={{ width: '100%' }}>
          {money.moneyFormatter({ amount: lineTotal, currency_code: money.currency_code })}
        </div>
      </Col>
      <Col xs={12} md={1}>
        <DeleteOutlined onClick={() => remove(field.name)} style={{ cursor: 'pointer' }} />
      </Col>
    </Row>
  );
}
