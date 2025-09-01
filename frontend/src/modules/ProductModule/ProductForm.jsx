import { Form, Input, InputNumber } from 'antd';

const { TextArea } = Input;

export default function ProductForm() {
  return (
    <>
      <Form.Item
        label="SKU"
        name="sku"
        rules={[{ required: true, message: 'SKU is required' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Name is required' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Price"
        name="price"
        initialValue={0}
        rules={[{ required: true, message: 'Price is required' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item
        label="Stock"
        name="stock"
        initialValue={0}
        rules={[{ required: true, message: 'Stock is required' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item
        label="Min Stock"
        name="minStock"
        initialValue={0}
        rules={[{ required: true, message: 'Min stock is required' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item
        label="Average Cost"
        name="averageCost"
        initialValue={0}
        rules={[{ required: true, message: 'Average cost is required' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item label="Description" name="description">
        <TextArea rows={4} />
      </Form.Item>
    </>
  );
}

