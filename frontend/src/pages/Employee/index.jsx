import useLanguage from '@/locale/useLanguage';
import EmployeeDataTableModule from '@/modules/EmployeeModule/EmployeeDataTableModule';

export default function Employee() {
  const translate = useLanguage();
  const entity = 'employee';

  const searchConfig = {
    searchFields: 'name,position',
  };

  const deleteModalLabels = ['name', 'position'];

  const readColumns = [
    { title: translate('first name'), dataIndex: 'name' },
    { title: translate('last name'), dataIndex: 'surname' },
    { title: translate('Position'), dataIndex: 'position' },
    { title: translate('Department'), dataIndex: 'department' },
    { title: translate('email'), dataIndex: 'email' },
    { title: translate('phone'), dataIndex: 'phone' },
  ];

  const dataTableColumns = [...readColumns];

  const Labels = {
    PANEL_TITLE: translate('employee'),
    DATATABLE_TITLE: translate('employee_list'),
    ADD_NEW_ENTITY: translate('add_new_employee'),
    ENTITY_NAME: translate('employee'),
  };

  const configPage = { entity, ...Labels };
  const config = { ...configPage, readColumns, dataTableColumns, searchConfig, deleteModalLabels };

  return <EmployeeDataTableModule config={config} />;
}

