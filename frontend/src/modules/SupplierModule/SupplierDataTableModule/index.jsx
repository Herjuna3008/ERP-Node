import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import SupplierForm from '../SupplierForm';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '@/services/supplier.service';

export default function SupplierDataTableModule() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await getSuppliers();
    if (data.success) {
      setSuppliers(data.result);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (values) => {
    if (editing) {
      await updateSupplier(editing.id, values);
    } else {
      await createSupplier(values);
    }
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (record) => {
    await deleteSupplier(record.id);
    load();
  };

  const filtered = suppliers.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.phone && s.phone.toLowerCase().includes(term))
    );
  });

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Address', dataIndex: 'address' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              setModalOpen(true);
            }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <ErpLayout>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by name, email or phone"
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add Supplier
        </Button>
      </Space>
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        loading={loading}
        scroll={{ x: 'max-content' }}
      />
      <Modal
        open={modalOpen}
        footer={null}
        destroyOnClose
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      >
        <SupplierForm onSubmit={handleSubmit} defaultValues={editing || {}} />
      </Modal>
    </ErpLayout>
  );
}
