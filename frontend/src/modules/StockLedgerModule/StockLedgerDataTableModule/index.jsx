import { useEffect, useMemo, useState } from 'react';
import { Table, DatePicker, Select, Space, Card, Badge } from 'antd';
import dayjs from 'dayjs';
import { request } from '@/request';
import { ErpLayout } from '@/layout';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const { RangePicker } = DatePicker;

export default function StockLedgerDataTableModule() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [product, setProduct] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const { result, success } = await request.get({ entity: 'stock-ledger' });
      if (success) {
        const mapped = result.map((item) => ({
          ...item,
          productName: item.product?.name,
          qtyIn: item.quantity > 0 ? item.quantity : 0,
          qtyOut: item.quantity < 0 ? Math.abs(item.quantity) : 0,
        }));
        setData(mapped);
        setFiltered(mapped);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let temp = [...data];
    if (dateRange && dateRange.length === 2) {
      temp = temp.filter((i) =>
        dayjs(i.created).isBetween(dateRange[0], dateRange[1], null, '[]'),
      );
    }
    if (product) {
      temp = temp.filter((i) => i.productName === product);
    }
    setFiltered(temp);
  }, [dateRange, product, data]);

  const productOptions = useMemo(
    () =>
      Array.from(new Set(data.map((i) => i.productName).filter(Boolean))).map(
        (p) => ({ label: p, value: p }),
      ),
    [data],
  );

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created',
      render: (d) => dayjs(d).format('YYYY-MM-DD'),
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      render: (text, record) =>
        record.product?.stock < record.product?.minStock ? (
          <Badge status="warning" text={text} />
        ) : (
          text
        ),
    },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Qty In', dataIndex: 'qtyIn' },
    { title: 'Qty Out', dataIndex: 'qtyOut' },
    { title: 'Cost', dataIndex: 'cost' },
  ];

  const chartData = useMemo(() => {
    return filtered.reduce((acc, item) => {
      const prev = acc.length ? acc[acc.length - 1].qty : 0;
      const qty = prev + item.qtyIn - item.qtyOut;
      acc.push({ date: dayjs(item.created).format('YYYY-MM-DD'), qty });
      return acc;
    }, []);
  }, [filtered]);

  return (
    <ErpLayout>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space>
          <RangePicker onChange={(vals) => setDateRange(vals)} />
          <Select
            allowClear
            placeholder="Product"
            style={{ minWidth: 200 }}
            options={productOptions}
            value={product}
            onChange={(value) => setProduct(value)}
          />
        </Space>
        <Table columns={columns} dataSource={filtered} rowKey="id" scroll={{ x: 'max-content' }} />
        {chartData.length > 0 && (
          <Card title="Stock Overview">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="qty" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
      </Space>
    </ErpLayout>
  );
}

