import CrudModule from '@/modules/CrudModule/CrudModule';
import EmployeeForm from '@/forms/EmployeeForm';

export default function EmployeeDataTableModule({ config }) {
  return (
    <CrudModule createForm={<EmployeeForm />} updateForm={<EmployeeForm />} config={config} />
  );
}

