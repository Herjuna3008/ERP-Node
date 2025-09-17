import { useEffect } from 'react';
import { Form, Input, Button } from 'antd';

const { TextArea } = Input;

export default function SupplierForm({ onSubmit, defaultValues = { name: '', email: '', phone: '', address: '' } }) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(defaultValues);
  }, [defaultValues, form]);

  const submit = (values) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={submit}>
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Name is required' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Email"
        name="email"
        rules={[{ type: 'email', message: 'Invalid email' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Phone"
        name="phone"
        rules={[{ required: true, message: 'Phone is required' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Address"
        name="address"
        rules={[{ required: true, message: 'Address is required' }]}
      >
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
}
