import { useMemo } from 'react';
import { Card, Col, Row, Button, Statistic } from 'antd';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ErpLayout } from '@/layout';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
});

export default function Reports() {
  const stats = useMemo(
    () => ({
      sales: 0,
      purchases: 0,
      expenses: 0,
      arAging: 0,
    }),
    []
  );

  const chartData = [
    { month: 'Jan', sales: 0, purchases: 0, expenses: 0 },
    { month: 'Feb', sales: 0, purchases: 0, expenses: 0 },
    { month: 'Mar', sales: 0, purchases: 0, expenses: 0 },
  ];

  const exportPDF = () => window.print();

  const exportXLSX = () => {
    const rows = [
      ['Metric', 'Amount'],
      ['Penjualan', stats.sales],
      ['Pembelian', stats.purchases],
      ['Pengeluaran', stats.expenses],
      ['AR Aging', stats.arAging],
    ];
    const csvContent = rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'report.xlsx');
    link.click();
  };

  return (
    <ErpLayout>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Penjualan"
              value={stats.sales}
              formatter={(value) => currencyFormatter.format(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pembelian"
              value={stats.purchases}
              formatter={(value) => currencyFormatter.format(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pengeluaran"
              value={stats.expenses}
              formatter={(value) => currencyFormatter.format(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="AR Aging"
              value={stats.arAging}
              formatter={(value) => currencyFormatter.format(value)}
            />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => currencyFormatter.format(value)} />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" name="Penjualan" />
            <Bar dataKey="purchases" fill="#82ca9d" name="Pembelian" />
            <Bar dataKey="expenses" fill="#ffc658" name="Pengeluaran" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <div style={{ marginTop: 16 }}>
        <Button type="primary" onClick={exportPDF} style={{ marginRight: 8 }}>
          Export PDF
        </Button>
        <Button onClick={exportXLSX}>Export XLSX</Button>
      </div>
    </ErpLayout>
  );
}

