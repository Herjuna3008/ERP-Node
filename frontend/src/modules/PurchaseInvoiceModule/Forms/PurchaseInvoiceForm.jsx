import { useEffect } from 'react';
import { Form, Row, Col, InputNumber, DatePicker, Select, Divider, Typography, Input, Button } from 'antd';
import dayjs from 'dayjs';
import { PlusOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { useDate, useMoney } from '@/settings';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';

import PurchaseItemRow from '../components/PurchaseItemRow';

const { Text } = Typography;

const STATUS_OPTIONS = ['draft', 'pending', 'sent', 'confirmed'];
const DISCOUNT_OPTIONS = ['amount', 'percent'];

export default function PurchaseInvoiceForm({ totals }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const money = useMoney();

  useEffect(() => {
    // ensure default items exist by relying on initial values
  }, []);

  return (
    <>
      <Row gutter={[12, 0]}>
        <Col xs={24} md={8}>
          <Form.Item
            name="supplier"
            label={translate('Supplier')}
            rules={[{ required: true, message: translate('Supplier is required') }]}
          >
            <AutoCompleteAsync
              entity="supplier"
              displayLabels={['name']}
              searchFields="name"
              redirectLabel="add_new_supplier"
              withRedirect
              urlToRedirect="/supplier"
            />
          </Form.Item>
        </Col>
        <Col xs={12} md={4}>
          <Form.Item
            label={translate('number')}
            name="number"
            rules={[{ required: true, message: translate('Number is required') }]}
            initialValue={1}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={12} md={4}>
          <Form.Item
            label={translate('year')}
            name="year"
            rules={[{ required: true, message: translate('Year is required') }]}
            initialValue={new Date().getFullYear()}
          >
            <InputNumber min={2000} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={12} md={4}>
          <Form.Item name="taxRate" label={translate('Tax rate')} initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>
        </Col>
        <Col xs={12} md={4}>
          <Form.Item
            name="globalDiscountValue"
            label={translate('Global discount')}
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={12} md={4}>
          <Form.Item name="globalDiscountType" label={translate('Type')} initialValue="amount">
            <Select
              options={DISCOUNT_OPTIONS.map((option) => ({
                value: option,
                label: translate(option),
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item
            name="status"
            label={translate('status')}
            initialValue="draft"
            rules={[{ required: true, message: translate('Status is required') }]}
          >
            <Select
              options={STATUS_OPTIONS.map((option) => ({ value: option, label: translate(option) }))}
            />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item
            name="date"
            label={translate('Date')}
            rules={[{ required: true, type: 'object', message: translate('Date is required') }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item
            name="dueDate"
            label={translate('Due date')}
            rules={[{ required: true, type: 'object', message: translate('Due date is required') }]}
            initialValue={dayjs().add(30, 'days')}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="notes" label={translate('Note')}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <Divider dashed />

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <PurchaseItemRow key={field.key} field={field} remove={remove} />
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() =>
                  add({ quantity: 1, unitPrice: 0, discountValue: 0, discountType: 'amount' })
                }
                block
                icon={<PlusOutlined />}
              >
                {translate('Add item')}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Divider dashed />

      <Row gutter={[12, 12]} justify="end">
        <Col xs={24} md={8}>
          <div className="whiteBox shadow" style={{ padding: 16 }}>
            <Row justify="space-between">
              <Col>
                <Text strong>{translate('Sub Total')}</Text>
              </Col>
              <Col>
                {money.moneyFormatter({ amount: totals.subTotal, currency_code: money.currency_code })}
              </Col>
            </Row>
            <Row justify="space-between">
              <Col>
                <Text>{translate('Discounted total')}</Text>
              </Col>
              <Col>
                {money.moneyFormatter({
                  amount: totals.discountedSubTotal,
                  currency_code: money.currency_code,
                })}
              </Col>
            </Row>
            <Row justify="space-between">
              <Col>
                <Text>{translate('Global discount')}</Text>
              </Col>
              <Col>
                {money.moneyFormatter({
                  amount: totals.globalDiscountAmount,
                  currency_code: money.currency_code,
                })}
              </Col>
            </Row>
            <Row justify="space-between">
              <Col>
                <Text>{translate('Tax total')}</Text>
              </Col>
              <Col>
                {money.moneyFormatter({ amount: totals.taxTotal, currency_code: money.currency_code })}
              </Col>
            </Row>
            <Divider />
            <Row justify="space-between">
              <Col>
                <Text strong>{translate('Total')}</Text>
              </Col>
              <Col>
                <Text strong>
                  {money.moneyFormatter({ amount: totals.total, currency_code: money.currency_code })}
                </Text>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </>
  );
}
