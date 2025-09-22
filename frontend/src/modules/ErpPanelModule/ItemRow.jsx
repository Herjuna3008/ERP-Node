import { useState, useEffect, useMemo, useCallback } from 'react';
import { Form, Input, InputNumber, Row, Col, Select, Modal, Space, Typography, Table, Grid, Button } from 'antd';

import { DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { request } from '@/request';
import { useMoney } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import { computeItemTotals } from '@/utils/invoiceCalculations';

let cachedProducts = null;

export default function ItemRow({
  field,
  remove,
  current = null,
  products: providedProducts,
  productsLoading: providedLoading = false,
}) {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const money = useMoney();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const fieldPath = useMemo(() => ['items', field.name], [field.name]);

  const [products, setProducts] = useState(providedProducts || []);
  const [productsLoading, setProductsLoading] = useState(providedProducts ? providedLoading : false);
  const [selectedProduct, setSelectedProduct] = useState(undefined);
  const [lineTotal, setLineTotal] = useState(0);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceModalLoading, setPriceModalLoading] = useState(false);
  const [priceEntries, setPriceEntries] = useState([]);

  const quantity = Form.useWatch([...fieldPath, 'quantity'], form) ?? 0;
  const price = Form.useWatch([...fieldPath, 'price'], form) ?? 0;
  const discountType = (Form.useWatch([...fieldPath, 'discountType'], form) || 'NONE').toString().toUpperCase();
  const discountValue = Form.useWatch([...fieldPath, 'discountValue'], form) ?? 0;
  const productId = Form.useWatch([...fieldPath, 'productId'], form);
  const unit = Form.useWatch([...fieldPath, 'unit'], form);

  useEffect(() => {
    if (!providedProducts) {
      let ignore = false;
      const loadProducts = async () => {
        if (cachedProducts) {
          if (!ignore) {
            setProducts(cachedProducts);
          }
          return;
        }
        setProductsLoading(true);
        const response = await request.list({ entity: 'products' });
        if (!ignore) {
          if (response?.success && Array.isArray(response.result)) {
            cachedProducts = response.result;
            setProducts(response.result);
          }
          setProductsLoading(false);
        }
      };
      loadProducts();
      return () => {
        ignore = true;
      };
    }
  }, [providedProducts]);

  useEffect(() => {
    if (providedProducts) {
      setProducts(providedProducts);
      setProductsLoading(providedLoading);
    }
  }, [providedProducts, providedLoading]);

  useEffect(() => {
    if (!form.getFieldValue([...fieldPath, 'discountType'])) {
      form.setFieldValue([...fieldPath, 'discountType'], 'NONE');
    }
    if (form.getFieldValue([...fieldPath, 'discountValue']) === undefined) {
      form.setFieldValue([...fieldPath, 'discountValue'], 0);
    }
  }, [fieldPath, form]);

  useEffect(() => {
    if (current) {
      const { items, invoice } = current;
      const sourceItems = invoice?.items ?? items;
      const itemIndex = typeof field.fieldKey !== 'undefined' ? field.fieldKey : field.name;
      const item = Array.isArray(sourceItems) ? sourceItems[itemIndex] : undefined;
      if (item) {
        form.setFieldsValue({
          items: {
            [field.name]: {
              ...item,
              discountType: item.discountType || item.discount_type || 'NONE',
              discountValue: item.discountValue ?? item.discount_value ?? 0,
              productId: item.productId || item.product?.id,
              unit: item.unit || item.product?.unit,
            },
          },
        });
        if (item.total !== undefined) {
          setLineTotal(item.total);
        }
      }
    }
  }, [current, field.fieldKey, field.name, fieldPath, form]);

  useEffect(() => {
    if (!productId) {
      setSelectedProduct(undefined);
      return;
    }
    const product = products.find((p) => `${p.id}` === `${productId}`);
    setSelectedProduct(product);
    if (product && !form.getFieldValue([...fieldPath, 'unit'])) {
      form.setFieldValue([...fieldPath, 'unit'], product.unit);
    }
  }, [productId, products, fieldPath, form]);

  useEffect(() => {
    const { total } = computeItemTotals({ quantity, price, discountType, discountValue });
    setLineTotal(total);
    form.setFieldValue([...fieldPath, 'total'], total);
  }, [quantity, price, discountType, discountValue, fieldPath, form]);

  const handleProductChange = useCallback(
    (value) => {
      const product = products.find((p) => `${p.id}` === `${value}`);
      setSelectedProduct(product);
      form.setFieldValue([...fieldPath, 'productId'], value);
      if (!product) {
        form.setFieldValue([...fieldPath, 'itemName'], '');
        form.setFieldValue([...fieldPath, 'unit'], '');
        form.setFieldValue([...fieldPath, 'price'], 0);
        form.setFieldValue([...fieldPath, 'description'], '');
        return;
      }
      form.setFieldValue([...fieldPath, 'itemName'], product?.name || '');
      form.setFieldValue([...fieldPath, 'unit'], product?.unit || '');
      form.setFieldValue([...fieldPath, 'price'], Number(product?.price ?? 0));
      if (!form.getFieldValue([...fieldPath, 'description']) && product?.description) {
        form.setFieldValue([...fieldPath, 'description'], product.description);
      }
    },
    [fieldPath, form, products]
  );

  const openPriceModal = useCallback(async () => {
    if (!productId) return;
    setPriceModalOpen(true);
    setPriceModalLoading(true);
    try {
      const response = await request.list({ entity: 'stockledger', options: { product: productId } });
      if (response?.success && Array.isArray(response.result)) {
        setPriceEntries(response.result);
      } else {
        setPriceEntries([]);
      }
    } catch (error) {
      setPriceEntries([]);
    } finally {
      setPriceModalLoading(false);
    }
  }, [productId]);

  const closePriceModal = () => {
    setPriceModalOpen(false);
  };

  const discountValueDisabled = discountType === 'NONE';
  const discountValueMax = discountType === 'PERCENTAGE' ? 100 : undefined;

  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.name}${product.sku ? ` (${product.sku})` : ''}`,
    data: product,
  }));

  const columns = [
    {
      title: translate('date'),
      dataIndex: 'created',
      key: 'created',
      render: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: translate('type'),
      dataIndex: 'entryType',
      key: 'entryType',
    },
    {
      title: translate('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: translate('cost_price'),
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (value, record) =>
        record.entryType === 'IN'
          ? money.amountFormatter({ amount: value, currency_code: money.currency_code })
          : '-',
    },
    {
      title: translate('sell_price'),
      dataIndex: 'sellPrice',
      key: 'sellPrice',
      render: (value, record) =>
        record.entryType === 'OUT'
          ? money.amountFormatter({ amount: value, currency_code: money.currency_code })
          : '-',
    },
  ];

  return (
    <>
      <Row gutter={[12, 12]} align="top">
        <Col xs={24} md={6}>
          <Form.Item
            name={[field.name, 'productId']}
            rules={[{ required: true, message: translate('select_product') }]}
          >
            <Select
              showSearch
              allowClear
              loading={productsLoading}
              disabled={productsLoading}
              placeholder={translate('select_product')}
              optionFilterProp="data-label"
              onChange={handleProductChange}
              filterOption={(input, option) =>
                option?.props?.['data-label']?.toLowerCase().includes(input.toLowerCase()) ?? false
              }
            >
              {productOptions.map((option) => (
                <Select.Option
                  key={option.value}
                  value={option.value}
                  data-label={option.label.toLowerCase()}
                >
                  <div>
                    <Typography.Text strong>{option.data.name}</Typography.Text>
                    {option.data.sku && (
                      <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                        {option.data.sku}
                      </Typography.Text>
                    )}
                    <div>
                      <Typography.Text type="secondary">
                        {translate('unit')}: {option.data.unit}
                      </Typography.Text>
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={[field.name, 'itemName']} hidden>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={4}>
          <Form.Item name={[field.name, 'description']}>
            <Input placeholder={translate('description')} />
          </Form.Item>
        </Col>
        <Col xs={12} md={3}>
          <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}
>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              controls={!isMobile}
              addonAfter={unit || selectedProduct?.unit || undefined}
            />
          </Form.Item>
        </Col>
        <Col xs={12} md={3}>
          <Form.Item name={[field.name, 'price']} rules={[{ required: true }]}
>
            <InputNumber
              className="moneyInput"
              min={0}
              controls={!isMobile}
              addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
              addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
            />
          </Form.Item>
        </Col>
        <Col xs={12} md={3}>
          <Form.Item name={[field.name, 'discountType']}>
            <Select>
              <Select.Option value="NONE">{translate('none')}</Select.Option>
              <Select.Option value="PERCENTAGE">{translate('percentage')}</Select.Option>
              <Select.Option value="FIXED">{translate('fixed_amount')}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={12} md={2}>
          <Form.Item name={[field.name, 'discountValue']}>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={discountValueMax}
              disabled={discountValueDisabled}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={3}>
          <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: '100%' }}>
            <InputNumber
              readOnly
              className="moneyInput"
              value={lineTotal}
              min={0}
              controls={false}
              addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
              addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
              formatter={(value) =>
                money.amountFormatter({ amount: value, currency_code: money.currency_code })
              }
            />
            <Space>
              <Button
                icon={<HistoryOutlined />}
                onClick={openPriceModal}
                disabled={!productId}
              />
              <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
            </Space>
          </Space>
          <Form.Item name={[field.name, 'total']} hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item name={[field.name, 'unit']} hidden>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Modal
        open={priceModalOpen}
        onCancel={closePriceModal}
        footer={null}
        title={translate('pricing_history')}
        width={screens.lg ? 720 : screens.md ? 600 : '90%'}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Text>
            {translate('last_cost_price')}: {selectedProduct?.lastCostPrice !== undefined
              ? money.amountFormatter({ amount: selectedProduct.lastCostPrice, currency_code: money.currency_code })
              : '-'}
          </Typography.Text>
          <Typography.Text>
            {translate('last_sell_price')}: {selectedProduct?.lastSellPrice !== undefined
              ? money.amountFormatter({ amount: selectedProduct.lastSellPrice, currency_code: money.currency_code })
              : '-'}
          </Typography.Text>
          <Table
            size="small"
            loading={priceModalLoading}
            columns={columns}
            dataSource={priceEntries}
            pagination={false}
            locale={{ emptyText: translate('no_price_history') }}
            rowKey={(record) => record.id || `${record.entryType}-${record.created}`}
          />
        </Space>
      </Modal>
    </>
  );
}
