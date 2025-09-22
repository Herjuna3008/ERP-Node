import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import useLanguage from '@/locale/useLanguage';
import productService from '@/services/productService';

const fields = {
  name: {
    type: 'string',
    required: true,
    label: 'name',
  },
  sku: {
    type: 'string',
    label: 'sku',
  },
  unit: {
    type: 'string',
    label: 'unit',
  },
  price: {
    type: 'currency',
    label: 'price',
    required: true,
  },
  stockQuantity: {
    type: 'number',
    label: 'stock_quantity',
  },
  lastCostPrice: {
    type: 'currency',
    label: 'last_cost_price',
    disableForForm: true,
  },
  lastSellPrice: {
    type: 'currency',
    label: 'last_sell_price',
    disableForForm: true,
  },
  description: {
    type: 'textarea',
    label: 'description',
    disableForTable: true,
  },
};

const ProductModule = () => {
  const translate = useLanguage();
  const entity = 'product';

  const Labels = {
    PANEL_TITLE: translate('product'),
    DATATABLE_TITLE: translate('product_list'),
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
  };

  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name,sku',
    outputValue: 'id',
  };

  const deleteModalLabels = ['name', 'sku'];

  const config = {
    entity,
    service: productService,
    fields,
    searchConfig,
    deleteModalLabels,
    ...Labels,
  };

  return (
    <CrudModule
      config={config}
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm />}
    />
  );
};

export default ProductModule;
