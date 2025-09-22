import { useState } from 'react';
import { Card, DatePicker, Button, Space, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';

const { RangePicker } = DatePicker;

export default function RecapPage() {
  const translate = useLanguage();
  const [range, setRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!range || range.length !== 2 || !range[0] || !range[1]) {
      message.warning(translate('Please select a date range'));
      return;
    }

    setDownloading(true);
    const params = {
      startDate: range[0].format('YYYY-MM-DD'),
      endDate: range[1].format('YYYY-MM-DD'),
    };

    const response = await request.download({
      entity: 'reports/recap',
      params,
      fileName: `recap-${params.startDate}-${params.endDate}.xlsx`,
    });

    if (response?.success) {
      const downloadName = response.fileName || `recap-${params.startDate}-${params.endDate}.xlsx`;
      const blobUrl = window.URL.createObjectURL(response.blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      message.success(translate('Download started'));
    }

    setDownloading(false);
  };

  return (
    <ErpLayout>
      <Card title={translate('recap')}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <RangePicker
            value={range}
            onChange={(values) => setRange(values)}
            allowClear={false}
            style={{ width: '100%' }}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloading}
            onClick={handleDownload}
          >
            {translate('Download')}
          </Button>
        </Space>
      </Card>
    </ErpLayout>
  );
}
