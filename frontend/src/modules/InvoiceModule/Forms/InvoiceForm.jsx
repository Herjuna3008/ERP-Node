import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Button, Select, Divider, Row, Col } from 'antd';

import { PlusOutlined } from '@ant-design/icons';

import { DatePicker } from 'antd';

import AutoCompleteAsync from '@/components/AutoCompleteAsync';

import ItemRow from '@/modules/ErpPanelModule/ItemRow';

import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';

import calculate from '@/utils/calculate';
import { useSelector } from 'react-redux';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { computeGlobalDiscountAmount } from '@/utils/invoiceCalculations';

export default function InvoiceForm({ subTotal = 0, current = null }) {
  const { last_invoice_number } = useSelector(selectFinanceSettings);

  if (last_invoice_number === undefined) {
    return <></>;
  }

  return <LoadInvoiceForm subTotal={subTotal} current={current} />;
}

function LoadInvoiceForm({ subTotal = 0, current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { last_invoice_number } = useSelector(selectFinanceSettings);
  const form = Form.useFormInstance();
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxSelection, setTaxSelection] = useState(null);
  const [taxTotal, setTaxTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(() => last_invoice_number + 1);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const globalDiscountType =
    (Form.useWatch('globalDiscountType', form) || 'NONE').toString().toUpperCase();
  const globalDiscountValue = Form.useWatch('globalDiscountValue', form) ?? 0;

  const handelTaxChange = (value) => {
    if (value === undefined) {
      setTaxSelection(null);
      setTaxRate(0);
      return;
    }
    const numericValue = Number(value) || 0;
    setTaxSelection(numericValue);
    setTaxRate(numericValue / 100);
  };

  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await request.list({ entity: 'products' });
        if (!ignore && response?.success && Array.isArray(response.result)) {
          setProducts(response.result);
        }
      } finally {
        if (!ignore) {
          setProductsLoading(false);
        }
      }
    };
    fetchProducts();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (current) {
      const {
        taxRate: currentTaxRate = 0,
        year,
        number,
        globalDiscountType: currentDiscountType,
        globalDiscountValue: currentDiscountValue,
      } = current;
      setTaxRate(Number(currentTaxRate) / 100);
      setTaxSelection(Number(currentTaxRate));
      setCurrentYear(year);
      setLastNumber(number);
      form.setFieldsValue({
        globalDiscountType: currentDiscountType || 'NONE',
        globalDiscountValue: currentDiscountValue ?? 0,
      });
    }
  }, [current, form]);
  useEffect(() => {
    const computedDiscount = computeGlobalDiscountAmount(subTotal, globalDiscountType, globalDiscountValue);
    setDiscountAmount(Number.parseFloat(computedDiscount));
    const netSubtotal = subTotal > computedDiscount ? calculate.sub(subTotal, computedDiscount) : 0;
    const computedTaxTotal = taxRate ? calculate.multiply(netSubtotal, taxRate) : 0;
    setTaxTotal(Number.parseFloat(computedTaxTotal));
    const currentTotal = calculate.add(netSubtotal, computedTaxTotal);
    setTotal(Number.parseFloat(currentTotal));
    form.setFieldsValue({
      discount: computedDiscount,
      subTotal,
      taxTotal: computedTaxTotal,
      total: currentTotal,
    });
  }, [subTotal, taxRate, globalDiscountType, globalDiscountValue, form]);

  const addField = useRef(false);

  useEffect(() => {
    addField.current.click();
  }, []);

  useEffect(() => {
    if (globalDiscountType === 'NONE' && globalDiscountValue) {
      form.setFieldValue('globalDiscountValue', 0);
    }
  }, [globalDiscountType, globalDiscountValue, form]);

  return (
    <>
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="client"
            label={translate('Client')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <AutoCompleteAsync
              entity={'client'}
              displayLabels={['name']}
              searchFields={'name'}
              redirectLabel={'Add New Client'}
              withRedirect
              urlToRedirect={'/customer'}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={3}>
          <Form.Item
            label={translate('number')}
            name="number"
            initialValue={lastNumber}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={3}>
          <Form.Item
            label={translate('year')}
            name="year"
            initialValue={currentYear}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col className="gutter-row" span={5}>
          <Form.Item
            label={translate('status')}
            name="status"
            rules={[
              {
                required: false,
              },
            ]}
            initialValue={'draft'}
          >
            <Select
              options={[
                { value: 'draft', label: translate('Draft') },
                { value: 'pending', label: translate('Pending') },
                { value: 'sent', label: translate('Sent') },
              ]}
            ></Select>
          </Form.Item>
        </Col>

        <Col className="gutter-row" span={8}>
          <Form.Item
            name="date"
            label={translate('Date')}
            rules={[
              {
                required: true,
                type: 'object',
              },
            ]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name="expiredDate"
            label={translate('Expire Date')}
            rules={[
              {
                required: true,
                type: 'object',
              },
            ]}
            initialValue={dayjs().add(30, 'days')}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={10}>
          <Form.Item label={translate('Note')} name="notes">
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Divider dashed />
      <Row gutter={[12, 12]} style={{ position: 'relative' }}>
        <Col xs={24} md={6}>
          <p>{translate('product')}</p>
        </Col>
        <Col xs={24} md={4}>
          <p>{translate('description')}</p>
        </Col>
        <Col xs={12} md={3}>
          <p>{translate('quantity')}</p>
        </Col>
        <Col xs={12} md={3}>
          <p>{translate('price')}</p>
        </Col>
        <Col xs={12} md={3}>
          <p>{translate('discount_type')}</p>
        </Col>
        <Col xs={12} md={2}>
          <p>{translate('discount_value')}</p>
        </Col>
        <Col xs={24} md={3}>
          <p>{translate('Total')}</p>
        </Col>
      </Row>
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <ItemRow
                key={field.key}
                remove={remove}
                field={field}
                current={current}
                products={products}
                productsLoading={productsLoading}
              ></ItemRow>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                ref={addField}
              >
                {translate('Add field')}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={6}>
          <Form.Item
            label={translate('global_discount_type')}
            name="globalDiscountType"
            initialValue="NONE"
          >
            <Select>
              <Select.Option value="NONE">{translate('none')}</Select.Option>
              <Select.Option value="PERCENTAGE">{translate('percentage')}</Select.Option>
              <Select.Option value="FIXED">{translate('fixed_amount')}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={4}>
          <Form.Item
            label={translate('global_discount_value')}
            name="globalDiscountValue"
            initialValue={0}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={globalDiscountType === 'PERCENTAGE' ? 100 : undefined}
              disabled={globalDiscountType === 'NONE'}
            />
          </Form.Item>
        </Col>
      </Row>
      <Divider dashed />
      <Form.Item name="discount" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item name="subTotal" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item name="taxTotal" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item name="total" hidden>
        <InputNumber />
      </Form.Item>
      <div style={{ position: 'relative', width: ' 100%', float: 'right' }}>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={5}>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                {translate('Save')}
              </Button>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={4} offset={10}>
            <p
              style={{
                paddingLeft: '12px',
                paddingTop: '5px',
                margin: 0,
                textAlign: 'right',
              }}
            >
              {translate('Sub Total')} :
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={subTotal} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={4} offset={15}>
            <p
              style={{
                paddingLeft: '12px',
                paddingTop: '5px',
                margin: 0,
                textAlign: 'right',
              }}
            >
              {translate('discount_amount')} :
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={discountAmount} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={4} offset={15}>
            <Form.Item
              name="taxRate"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <SelectAsync
                value={taxSelection}
                onChange={handelTaxChange}
                entity={'taxes'}
                outputValue={'taxValue'}
                displayLabels={['taxName']}
                withRedirect={true}
                urlToRedirect="/taxes"
                redirectLabel={translate('Add New Tax')}
                placeholder={translate('Select Tax Value')}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={taxTotal} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={4} offset={15}>
            <p
              style={{
                paddingLeft: '12px',
                paddingTop: '5px',
                margin: 0,
                textAlign: 'right',
              }}
            >
              {translate('Total')} :
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={total} />
          </Col>
        </Row>
      </div>
    </>
  );
}
