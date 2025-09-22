import { useEffect } from 'react';
import { Card, Form, Row, Col, Input, InputNumber, DatePicker, Button, Table, Space } from 'antd';
import dayjs from 'dayjs';
import { ReloadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import useOnFetch from '@/hooks/useOnFetch';
import { request } from '@/request';
import { erp } from '@/redux/erp/actions';
import { selectCreatedItem } from '@/redux/erp/selectors';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import SelectAsync from '@/components/SelectAsync';
import { useDate, useMoney } from '@/settings';
import Loading from '@/components/Loading';

const ENTITY = 'expense';

export default function ExpenseModule() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const dispatch = useDispatch();
  const { isLoading, isSuccess } = useSelector(selectCreatedItem);
  const [form] = Form.useForm();

  const { result, isLoading: listLoading, onFetch } = useOnFetch();

  const loadExpenses = () => onFetch(request.list({ entity: ENTITY }));

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'create' }));
      loadExpenses();
    }
  }, [isSuccess]);

  const handleSubmit = (values) => {
    const payload = { ...values };
    if (values.expenseDate) {
      payload.expenseDate = dayjs(values.expenseDate).format('YYYY-MM-DD');
    }
    dispatch(erp.create({ entity: ENTITY, jsonData: payload }));
  };

  const columns = [
    {
      title: translate('Date'),
      dataIndex: 'expenseDate',
      render: (value) => (value ? dayjs(value).format(dateFormat) : ''),
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
    },
    {
      title: translate('Reference'),
      dataIndex: 'reference',
    },
    {
      title: translate('Category'),
      dataIndex: ['category', 'name'],
    },
    {
      title: translate('Supplier'),
      dataIndex: ['supplier', 'name'],
    },
    {
      title: translate('Amount'),
      dataIndex: 'amount',
      onCell: () => ({
        style: {
          textAlign: 'right',
          whiteSpace: 'nowrap',
          direction: 'ltr',
        },
      }),
      render: (value) => moneyFormatter({ amount: value }),
    },
  ];

  return (
    <ErpLayout>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Card title={translate('Log expense')}>
            <Loading isLoading={isLoading}>
              <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{ expenseDate: dayjs() }}>
                <Form.Item
                  name="description"
                  label={translate('Description')}
                  rules={[{ required: true, message: translate('Description is required') }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="reference" label={translate('Reference')}>
                  <Input />
                </Form.Item>
                <Row gutter={[12, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="amount"
                      label={translate('Amount')}
                      rules={[{ required: true, message: translate('Amount is required') }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="expenseDate"
                      label={translate('Date')}
                      rules={[{ required: true, message: translate('Date is required') }]}
                    >
                      <DatePicker style={{ width: '100%' }} format={dateFormat} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[12, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="category" label={translate('Category')}>
                      <SelectAsync entity="expensecategory" displayLabels={['name']} outputValue="id" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="supplier" label={translate('Supplier')}>
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
                </Row>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    {translate('Save')}
                  </Button>
                </Form.Item>
              </Form>
            </Loading>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card
            title={translate('Expenses')}
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} onClick={loadExpenses}>
                  {translate('Refresh')}
                </Button>
              </Space>
            }
          >
            <Table
              rowKey={(item) => item.id}
              columns={columns}
              dataSource={result || []}
              loading={listLoading}
              pagination={false}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>
    </ErpLayout>
  );
}
