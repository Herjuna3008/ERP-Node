import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';

import { PageHeader } from '@ant-design/pro-layout';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Row,
  Col,
  Table,
  Typography,
  message,
} from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';

import { ErpLayout } from '@/layout';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';

const { RangePicker } = DatePicker;

const defaultRange = [dayjs().startOf('month'), dayjs().endOf('month')];

export default function Recap() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [recapData, setRecapData] = useState(null);

  const buildParams = (rangeValue) => {
    const [start, end] = rangeValue || [];
    if (!start || !end) {
      return null;
    }
    return {
      startDate: start.startOf('day').format('YYYY-MM-DD'),
      endDate: end.endOf('day').format('YYYY-MM-DD'),
    };
  };

  const fetchRecap = useCallback(
    async (rangeValue) => {
      const params = buildParams(rangeValue);
      if (!params) {
        message.warning(translate('please_select_a_period'));
        return;
      }
      setLoading(true);
      try {
        const query = `reports/recap?startDate=${params.startDate}&endDate=${params.endDate}&format=json`;
        const response = await request.get({ entity: query });
        if (response?.success) {
          setRecapData(response.result);
        } else {
          setRecapData(null);
          message.error(response?.message || translate('failed_to_load_data'));
        }
      } finally {
        setLoading(false);
      }
    },
    [translate]
  );

  useEffect(() => {
    form.setFieldsValue({ period: defaultRange });
    fetchRecap(defaultRange);
  }, [fetchRecap, form]);

  const handleGenerate = async () => {
    const values = await form.validateFields();
    fetchRecap(values.period);
  };

  const handleDownload = async () => {
    const params = buildParams(form.getFieldValue('period'));
    if (!params) {
      message.warning(translate('please_select_a_period'));
      return;
    }
    setDownloading(true);
    try {
      await request.get({ entity: 'reports/recap?startDate=' + params.startDate + '&endDate=' + params.endDate + '&format=json' });
      const response = await axios.get('reports/recap', {
        params,
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recap-${params.startDate}-to-${params.endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(translate('download_failed'));
    } finally {
      setDownloading(false);
    }
  };

  const salesColumns = [
    {
      title: translate('Number'),
      dataIndex: 'number',
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (value) => (value ? dayjs(value).format(dateFormat) : ''),
    },
    {
      title: translate('client'),
      dataIndex: 'client',
      render: (value) => value?.name || value || '-',
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      align: 'right',
      render: (value) => moneyFormatter({ amount: value }),
    },
  ];

  const purchaseColumns = [
    {
      title: translate('Number'),
      dataIndex: 'number',
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (value) => (value ? dayjs(value).format(dateFormat) : ''),
    },
    {
      title: translate('supplier'),
      dataIndex: 'supplier',
      render: (value) => value || '-',
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      align: 'right',
      render: (value) => moneyFormatter({ amount: value }),
    },
  ];

  const expenseColumns = [
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (value) => (value ? dayjs(value).format(dateFormat) : ''),
    },
    {
      title: translate('expense_category'),
      dataIndex: 'category',
      render: (value) => value || '-',
    },
    {
      title: translate('supplier'),
      dataIndex: 'supplier',
      render: (value) => value || '-',
    },
    {
      title: translate('description'),
      dataIndex: 'description',
      render: (value) => value || '-',
    },
    {
      title: translate('amount'),
      dataIndex: 'amount',
      align: 'right',
      render: (value) => moneyFormatter({ amount: value }),
    },
  ];

  const totals = recapData?.totals || {};

  return (
    <ErpLayout>
      <PageHeader
        title={translate('recap_report')}
        ghost={false}
        extra={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            loading={downloading}
          >
            {translate('Download')}
          </Button>,
        ]}
      />
      <Form form={form} layout="inline" onFinish={handleGenerate} style={{ marginBottom: 24 }}>
        <Form.Item
          name="period"
          rules={[{ required: true, message: translate('please_select_a_period') }]}
        >
          <RangePicker allowClear={false} format={dateFormat} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
            {translate('Generate')}
          </Button>
        </Form.Item>
      </Form>

      {recapData && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={6}>
              <Card>
                <Typography.Text>{translate('Total Sales')}</Typography.Text>
                <Typography.Title level={4}>
                  {moneyFormatter({ amount: totals.sales || 0 })}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Typography.Text>{translate('Total Purchases')}</Typography.Text>
                <Typography.Title level={4}>
                  {moneyFormatter({ amount: totals.purchases || 0 })}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Typography.Text>{translate('Total Expenses')}</Typography.Text>
                <Typography.Title level={4}>
                  {moneyFormatter({ amount: totals.expenses || 0 })}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Typography.Text strong>{translate('Profit')}</Typography.Text>
                <Typography.Title level={4}>
                  {moneyFormatter({ amount: totals.profit || 0 })}
                </Typography.Title>
              </Card>
            </Col>
          </Row>

          <Card title={translate('sales')} style={{ marginBottom: 24 }}>
            <Table
              rowKey={(record) => record.id}
              dataSource={recapData.sales?.items || []}
              columns={salesColumns}
              pagination={false}
              loading={loading}
            />
          </Card>

          <Card title={translate('purchases')} style={{ marginBottom: 24 }}>
            <Table
              rowKey={(record) => record.id}
              dataSource={recapData.purchases?.items || []}
              columns={purchaseColumns}
              pagination={false}
              loading={loading}
            />
          </Card>

          <Card title={translate('expenses')}>
            <Table
              rowKey={(record) => record.id}
              dataSource={recapData.expenses?.items || []}
              columns={expenseColumns}
              pagination={false}
              loading={loading}
            />
          </Card>
        </>
      )}
    </ErpLayout>
  );
}
