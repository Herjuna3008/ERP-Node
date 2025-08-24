import CrudModule from '@/modules/CrudModule/CrudModule';
import ExpenseCategoryForm from './ExpenseCategoryForm';

export default function ExpenseCategoryModule({ config }) {
  return (
    <CrudModule
      createForm={<ExpenseCategoryForm />}
      updateForm={<ExpenseCategoryForm />}
      config={config}
    />
  );
}
