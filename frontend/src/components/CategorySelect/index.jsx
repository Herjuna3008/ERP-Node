import { useEffect, useState } from 'react';
import { Select, Button, Modal, Form, Input, List, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

export default function CategorySelect({ value, onChange }) {
  const translate = useLanguage();
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = () => {
    fetch('/api/expensecategory')
      .then((res) => res.json())
      .then((data) => setCategories(data.result || []));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (values) => {
    await fetch('/api/expensecategory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    fetchCategories();
  };

  const updateCategory = async (id) => {
    await fetch(`/api/expensecategory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    });
    setEditingId(null);
    setEditName('');
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    await fetch(`/api/expensecategory/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  const options = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        dropdownRender={(menu) => (
          <>
            {menu}
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
              style={{ width: '100%', textAlign: 'left' }}
            >
              {translate('expense_category')}
            </Button>
          </>
        )}
      />
      <Modal open={open} onCancel={() => setOpen(false)} footer={null} title={translate('expense_category')}>
        <Form layout="inline" onFinish={addCategory} style={{ marginBottom: 16 }}>
          <Form.Item name="name" rules={[{ required: true }]}> 
            <Input placeholder={translate('expense_category')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {translate('add')}
            </Button>
          </Form.Item>
        </Form>
        <List
          dataSource={categories}
          renderItem={(item) => (
            <List.Item
              actions={[
                editingId === item.id ? (
                  <Space>
                    <Button type="link" onClick={() => updateCategory(item.id)}>
                      {translate('save')}
                    </Button>
                    <Button type="link" onClick={() => setEditingId(null)}>
                      {translate('cancel')}
                    </Button>
                  </Space>
                ) : (
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingId(item.id);
                      setEditName(item.name);
                    }}
                  />
                ),
                <Button
                  danger
                  type="link"
                  icon={<DeleteOutlined />}
                  onClick={() => deleteCategory(item.id)}
                />, 
              ]}
            >
              {editingId === item.id ? (
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              ) : (
                item.name
              )}
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
}
