import { useState } from 'react';
import { Card, Form, Button, DatePicker, message, Typography } from 'antd';
import dayjs from 'dayjs';

import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import recapService from '@/services/recapService';

const { RangePicker } = DatePicker;

const RecapModule = () => {
  const translate = useLanguage();
  const [form] = Form.useForm();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (values) => {
    try {
      setDownloading(true);
      const [start, end] = values.period || [];
      const payload = {
        startDate: start ? dayjs(start).format('YYYY-MM-DD') : undefined,
        endDate: end ? dayjs(end).format('YYYY-MM-DD') : undefined,
      };
      const response = await recapService.download(payload);
      if (!response || response?.data === undefined) {
        message.error(translate('download_failed'));
        return;
      }
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'recap.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success(translate('download_started'));
    } catch (error) {
      message.error(translate('download_failed'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ErpLayout>
      <Card title={translate('recap_report')} bordered={false}>
        <Typography.Paragraph>
          {translate('recap_report_description')}
        </Typography.Paragraph>
        <Form form={form} layout="inline" onFinish={handleDownload}>
          <Form.Item name="period" label={translate('select_date_range')}>
            <RangePicker allowClear style={{ minWidth: 260 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={downloading}>
              {translate('download')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ErpLayout>
  );
};

export default RecapModule;
