import React from 'react';
import { Form, Input } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function ExpenseCategoryForm() {
  const translate = useLanguage();
  return (
    <>
      <Form.Item
        label={translate('name')}
        name="name"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
    </>
  );
}
