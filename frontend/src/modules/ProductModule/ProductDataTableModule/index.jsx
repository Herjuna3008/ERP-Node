import React, { useEffect, useState } from 'react';
import { Table, Button, Drawer, Input, Space, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import ProductForm from '../ProductForm';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/product.service';

export default function ProductDataTableModule() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sorter, setSorter] = useState({});
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const data = await getProducts();
    if (data.success) {
      setProducts(data.result);
      setPagination((p) => ({ ...p, total: data.result.length }));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleTableChange = (pag, filters, sort) => {
    setPagination(pag);
    setSorter(sort);
  };

  const handleSubmit = async (values) => {
    if (editing) {
      await updateProduct(editing.id, values);
    } else {
      await createProduct(values);
    }
    setDrawerOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const handleDelete = async (record) => {
    await deleteProduct(record.id);
    load();
  };

  const filtered = products.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.sku && p.sku.toLowerCase().includes(term))
    );
  });

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      sorter: (a, b) => a.sku.localeCompare(b.sku),
      sortOrder: sorter.field === 'sku' && sorter.order,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sorter.field === 'name' && sorter.order,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      sorter: (a, b) => a.price - b.price,
      sortOrder: sorter.field === 'price' && sorter.order,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      sorter: (a, b) => a.stock - b.stock,
      sortOrder: sorter.field === 'stock' && sorter.order,
    },
    {
      title: 'Min Stock',
      dataIndex: 'minStock',
      sorter: (a, b) => a.minStock - b.minStock,
      sortOrder: sorter.field === 'minStock' && sorter.order,
    },
    {
      title: 'Average Cost',
      dataIndex: 'averageCost',
      sorter: (a, b) => a.averageCost - b.averageCost,
      sortOrder: sorter.field === 'averageCost' && sorter.order,
    },
    { title: 'Description', dataIndex: 'description' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              form.setFieldsValue(record);
              setDrawerOpen(true);
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
          placeholder="Search by SKU or name"
          allowClear
          onSearch={(val) => setSearch(val)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setDrawerOpen(true);
          }}
        >
          Add Product
        </Button>
      </Space>
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
      />
      <Drawer
        title={editing ? 'Edit Product' : 'Add Product'}
        width={480}
        open={drawerOpen}
        destroyOnClose
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={editing || {}}
        >
          <ProductForm />
          <Button type="primary" onClick={() => form.submit()}>
            Save
          </Button>
        </Form>
      </Drawer>
    </ErpLayout>
  );
}

