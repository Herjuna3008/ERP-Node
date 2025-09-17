import dayjs from 'dayjs';
import { Form, Input, InputNumber, Button, DatePicker } from 'antd';
import SelectAsync from '@/components/SelectAsync';
import CategorySelect from '@/components/CategorySelect';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';

export default function PayrollForm({ onSubmit }) {
  const [form] = Form.useForm();
  const translate = useLanguage();
  const { dateFormat } = useDate();

  const handleFinish = (values) => {
    onSubmit({
      ...values,
      date: values.date.format('YYYY-MM-DD'),
    });
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item
        name="employee"
        label={translate('Employee')}
        rules={[{ required: true }]}
      >
        <SelectAsync entity="employee" displayLabels={['firstName', 'lastName']} />
      </Form.Item>

      <Form.Item
        name="amount"
        label={translate('Amount')}
        rules={[{ required: true }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>

      <Form.Item
        name="date"
        label={translate('Date')}
        rules={[{ required: true }]}
        initialValue={dayjs()}
      >
        <DatePicker format={dateFormat} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="category"
        label={translate('expense_category')}
        rules={[{ required: true }]}
      >
        <CategorySelect />
      </Form.Item>

      <Form.Item name="description" label={translate('Description')}>
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {translate('Save')}
        </Button>
      </Form.Item>
    </Form>
  );
}
