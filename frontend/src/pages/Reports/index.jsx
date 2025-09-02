import { useEffect, useState, useMemo } from 'react';
import { Card, Col, Row, Button, Statistic, DatePicker, Tabs } from 'antd';
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
import api from '@/services/api';
import useLanguage from '@/locale/useLanguage';

const { RangePicker } = DatePicker;

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
});

export default function Reports() {
  const translate = useLanguage();
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState({ sales: [], purchases: [], expenses: [] });
  const [range, setRange] = useState([]);

  const fetchData = () => {
    const params = [];
    if (range && range.length === 2) {
      params.push(`startDate=${range[0].format('YYYY-MM-DD')}`);
      params.push(`endDate=${range[1].format('YYYY-MM-DD')}`);
    }
    const query = params.length ? `?${params.join('&')}` : '';
    api.get({ entity: `/reports/summary${query}` }).then((res) => setSummary(res));
    api.get({ entity: `/reports/analytics${query}` }).then((res) => setAnalytics(res));
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  const chartData = useMemo(() => {
    const periods = new Set();
    analytics.sales.forEach((i) => periods.add(i.period));
    analytics.purchases.forEach((i) => periods.add(i.period));
    analytics.expenses.forEach((i) => periods.add(i.period));
    return Array.from(periods)
      .sort()
      .map((p) => ({
        period: p,
        sales: Number(analytics.sales.find((i) => i.period === p)?.total || 0),
        purchases: Number(analytics.purchases.find((i) => i.period === p)?.total || 0),
        expenses: Number(analytics.expenses.find((i) => i.period === p)?.total || 0),
      }));
  }, [analytics]);

  const exportFile = (format) => {
    const params = new URLSearchParams();
    if (range && range.length === 2) {
      params.append('startDate', range[0].format('YYYY-MM-DD'));
      params.append('endDate', range[1].format('YYYY-MM-DD'));
    }
    params.append('format', format);
    window.open(`/reports/summary?${params.toString()}`, '_blank');
  };

  return (
    <ErpLayout>
      <Card style={{ marginBottom: 16 }}>
        <RangePicker value={range} onChange={(v) => setRange(v)} />
      </Card>
      <Tabs
        defaultActiveKey="summary"
        items={[
          {
            key: 'summary',
            label: translate('Summary'),
            children: (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title={translate('Sales')}
                        value={summary?.sales || 0}
                        formatter={(value) => currencyFormatter.format(value)}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title={translate('Purchases')}
                        value={summary?.purchases || 0}
                        formatter={(value) => currencyFormatter.format(value)}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title={translate('Expenses')}
                        value={summary?.expenses || 0}
                        formatter={(value) => currencyFormatter.format(value)}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title={translate('Margin')}
                        value={summary?.margin || 0}
                        formatter={(value) => currencyFormatter.format(value)}
                      />
                    </Card>
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    onClick={() => exportFile('pdf')}
                    style={{ marginRight: 8 }}
                  >
                    {translate('Export PDF')}
                  </Button>
                  <Button onClick={() => exportFile('excel')}>
                    {translate('Export XLSX')}
                  </Button>
                </div>
              </>
            ),
          },
          {
            key: 'analytics',
            label: translate('Analytics'),
            children: (
              <Card>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" name={translate('Sales')} />
                    <Bar dataKey="purchases" fill="#82ca9d" name={translate('Purchases')} />
                    <Bar dataKey="expenses" fill="#ffc658" name={translate('Expenses')} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            ),
          },
        ]}
      />
    </ErpLayout>
  );
}

