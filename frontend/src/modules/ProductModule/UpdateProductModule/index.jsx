import { useEffect } from 'react';
import { ErpLayout } from '@/layout';
import { PageHeader } from '@ant-design/pro-layout';
import { Tag, Button, Form, Divider } from 'antd';
import { ArrowLeftOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../ProductForm';
import useLanguage from '@/locale/useLanguage';
import { getProduct, updateProduct } from '@/services/product.service';

export default function UpdateProductModule({ config }) {
  const translate = useLanguage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const entity = config?.entity || 'products';
  const { id } = useParams();

  useEffect(() => {
    const load = async () => {
      const data = await getProduct(id);
      if (data.success) {
        form.setFieldsValue(data.result);
      }
    };
    load();
  }, [id]);

  const onFinish = async (values) => {
    try {
      await updateProduct(id, values);
      navigate(`/${entity}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ErpLayout>
      <PageHeader
        onBack={() => navigate(`/${entity}`)}
        backIcon={<ArrowLeftOutlined />}
        title={translate('Update')}
        ghost={false}
        tags={<Tag>{translate('Draft')}</Tag>}
        extra={[
          <Button key="cancel" onClick={() => navigate(`/${entity}`)} icon={<CloseCircleOutlined />}> 
            {translate('Cancel')}
          </Button>,
          <Button key="save" type="primary" icon={<PlusOutlined />} onClick={() => form.submit()}>
            {translate('Save')}
          </Button>,
        ]}
        style={{ padding: '20px 0px' }}
      />
      <Divider dashed />
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <ProductForm />
      </Form>
    </ErpLayout>
  );
}
