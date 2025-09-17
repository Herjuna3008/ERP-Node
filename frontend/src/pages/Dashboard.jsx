import { Card, Col, Row, Statistic } from 'antd';
import DashboardModule from '@/modules/DashboardModule';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
});

export default function Dashboard() {
  const summary = {
    purchases: 0,
    expenses: 0,
    lowStock: 0,
    payroll: 0,
  };

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Pembelian"
              value={summary.purchases}
              formatter={(value) => currencyFormatter.format(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pengeluaran"
              value={summary.expenses}
              formatter={(value) => currencyFormatter.format(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Stok Menipis" value={summary.lowStock} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Gaji"
              value={summary.payroll}
              formatter={(value) => currencyFormatter.format(value)}
            />
          </Card>
        </Col>
      </Row>
      <DashboardModule />
    </>
  );
}
