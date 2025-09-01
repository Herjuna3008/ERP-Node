import { Row, Col, Form, Input, InputNumber, Button, Divider, DatePicker } from 'antd';
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
      <Row gutter={[12, 0]}>
        <Col span={8}>
          <p>Product</p>
        </Col>
        <Col span={4}>
          <p>Quantity</p>
        </Col>
        <Col span={4}>
          <p>Cost</p>
        </Col>
        <Col span={4}>
          <p>Total</p>
        </Col>
      </Row>
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Row key={field.key} gutter={[12, 12]} style={{ position: 'relative' }}>
                <Col span={8}>
                  <Form.Item
                    name={[field.name, 'product']}
                    rules={[{ required: true, message: 'Product is required' }]}
                  >
                    <SelectAsync entity={'products'} outputValue={'id'} displayLabels={['name']} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name={[field.name, 'quantity']}
                    rules={[{ required: true, message: 'Quantity is required' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name={[field.name, 'cost']}
                    rules={[{ required: true, message: 'Cost is required' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name={[field.name, 'total']}>
                    <InputNumber readOnly min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <div style={{ position: 'absolute', right: '-20px', top: '5px' }}>
                  <DeleteOutlined onClick={() => remove(field.name)} />
                </div>
              </Row>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Item
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
}

