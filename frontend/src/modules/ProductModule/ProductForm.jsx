import { Form, Input, InputNumber } from 'antd';

const { TextArea } = Input;

export default function ProductForm() {
  return (
    <>
      <Form.Item
        label="SKU"
        name="sku"
        rules={[
          { required: true, message: 'SKU is required' },
          {
            pattern: /^[A-Za-z0-9_-]+$/,
            message: 'SKU must be alphanumeric',
          },
        ]}
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
        rules={[
          { required: true, message: 'Price is required' },
          { type: 'number', min: 0, message: 'Price must be at least 0' },
        ]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item
        label="Stock"
        name="stock"
        initialValue={0}
        rules={[
          { required: true, message: 'Stock is required' },
          { type: 'number', min: 0, message: 'Stock must be at least 0' },
        ]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item
        label="Min Stock"
        name="minStock"
        initialValue={0}
        rules={[
          { required: true, message: 'Min stock is required' },
          { type: 'number', min: 0, message: 'Min stock must be at least 0' },
        ]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item
        label="Average Cost"
        name="averageCost"
        initialValue={0}
        rules={[
          { required: true, message: 'Average cost is required' },
          { type: 'number', min: 0, message: 'Average cost must be at least 0' },
        ]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item label="Description" name="description">
        <TextArea rows={4} />
      </Form.Item>
    </>
  );
}

