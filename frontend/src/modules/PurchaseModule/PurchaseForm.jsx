import { Row, Col, Form, Input, InputNumber, Button, Divider, DatePicker, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import SelectAsync from '@/components/SelectAsync';

export default function PurchaseForm() {
  return (
    <>
      <Row gutter={[12, 0]}>
        <Col span={8}>
          <Form.Item
            label="Supplier"
            name="supplier"
            rules={[{ required: true, message: 'Supplier is required' }]}
          >
            <SelectAsync entity={'suppliers'} outputValue={'id'} displayLabels={['name']} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Date"
            name="date"
            initialValue={dayjs()}
            rules={[{ required: true, type: 'object', message: 'Date is required' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Notes" name="notes">
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Divider dashed />
      <Form.List name="items">
        {(fields, { add, remove }) => {
          const columns = [
            {
              title: 'Product',
              dataIndex: 'product',
              render: (_, record) => (
                <Form.Item
                  name={[record.name, 'product']}
                  rules={[{ required: true, message: 'Product is required' }]}
                  style={{ marginBottom: 0 }}
                >
                  <SelectAsync entity={'products'} outputValue={'id'} displayLabels={['name']} />
                </Form.Item>
              ),
            },
            {
              title: 'Quantity',
              dataIndex: 'quantity',
              render: (_, record) => (
                <Form.Item
                  name={[record.name, 'quantity']}
                  rules={[{ required: true, message: 'Quantity is required' }]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              ),
            },
            {
              title: 'Cost',
              dataIndex: 'cost',
              render: (_, record) => (
                <Form.Item
                  name={[record.name, 'cost']}
                  rules={[{ required: true, message: 'Cost is required' }]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              ),
            },
            {
              title: 'Total',
              dataIndex: 'total',
              render: (_, record) => (
                <Form.Item name={[record.name, 'total']} style={{ marginBottom: 0 }}>
                  <InputNumber readOnly min={0} style={{ width: '100%' }} />
                </Form.Item>
              ),
            },
            {
              title: '',
              dataIndex: 'actions',
              render: (_, record) => (
                <DeleteOutlined onClick={() => remove(record.name)} />
              ),
            },
          ];

          return (
            <>
              <Table pagination={false} dataSource={fields} columns={columns} rowKey="key" />
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Item
                </Button>
              </Form.Item>
            </>
          );
        }}
      </Form.List>
    </>
  );
}

