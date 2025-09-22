import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import useLanguage from '@/locale/useLanguage';
import supplierService from '@/services/supplierService';

const fields = {
  name: {
    type: 'string',
    required: true,
    label: 'name',
  },
  email: {
    type: 'email',
    label: 'email',
  },
  phone: {
    type: 'phone',
    label: 'phone',
  },
  address: {
    type: 'textarea',
    label: 'address',
    disableForTable: true,
  },
};

const SupplierModule = () => {
  const translate = useLanguage();
  const entity = 'supplier';

  const Labels = {
    PANEL_TITLE: translate('supplier'),
    DATATABLE_TITLE: translate('supplier_list'),
    ADD_NEW_ENTITY: translate('add_new_supplier'),
    ENTITY_NAME: translate('supplier'),
  };

  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name,email,phone',
    outputValue: 'id',
  };

  const deleteModalLabels = ['name', 'email'];

  const config = {
    entity,
    service: supplierService,
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

export default SupplierModule;
