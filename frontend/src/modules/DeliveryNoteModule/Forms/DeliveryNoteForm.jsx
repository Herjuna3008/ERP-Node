import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Button, Row, Col, Divider, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';

export default function DeliveryNoteForm({ current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const addField = useRef(null);

  useEffect(() => {
    if (!current) {
      addField.current?.click();
    }
  }, []);

  return (
    <>
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="client"
            label={translate('Client')}
            rules={[{ required: true }]}
          >
            <AutoCompleteAsync
              entity={'client'}
              displayLabels={['name']}
              searchFields={'name'}
              redirectLabel={translate('Add New Client')}
              withRedirect
              urlToRedirect={'/customer'}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="date"
            label={translate('Date')}
            initialValue={dayjs()}
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item name="notes" label={translate('Note')}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Divider dashed />
      <Row gutter={[12, 12]}>
        <Col className="gutter-row" span={12}>
          <p>{translate('Product')}</p>
        </Col>
        <Col className="gutter-row" span={8}>
          <p>{translate('Quantity')}</p>
        </Col>
      </Row>
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Row key={field.key} gutter={[12, 12]} style={{ position: 'relative' }}>
                <Col className="gutter-row" span={12}>
                  <Form.Item
                    name={[field.name, 'product']}
                    rules={[{ required: true }]}
                  >
                    <AutoCompleteAsync
                      entity={'product'}
                      displayLabels={['name']}
                      searchFields={'name'}
                      redirectLabel={translate('Add New Product')}
                      withRedirect
                      urlToRedirect={'/products/create'}
                    />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" span={8}>
                  <Form.Item
                    name={[field.name, 'quantity']}
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" span={4}>
                  <DeleteOutlined onClick={() => remove(field.name)} />
                </Col>
                <Form.Item
                  name={[field.name, 'price']}
                  initialValue={0}
                  style={{ display: 'none' }}
                >
                  <InputNumber />
                </Form.Item>
              </Row>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                ref={addField}
              >
                {translate('Add field')}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
}

