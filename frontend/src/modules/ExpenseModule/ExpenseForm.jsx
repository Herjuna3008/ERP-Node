import { useEffect, useState } from 'react';
import { z } from 'zod';
import RHFForm from '@/forms/RHFForm';
import RHFInput from '@/forms/RHFInput';
import RHFSelect from '@/forms/RHFSelect';
import useLanguage from '@/locale/useLanguage';

const schema = z.object({
  amount: z.number().min(0, 'Amount is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.number({ required_error: 'Category is required' }),
});

export default function ExpenseForm({ onSubmit }) {
  const translate = useLanguage();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/expensecategory')
      .then((res) => res.json())
      .then((data) => setCategories(data.result || []));
  }, []);

  const defaultValues = { amount: 0, description: '', category: '' };

  const options = categories.map((cat) => ({ value: cat.id, label: cat.name }));

  return (
    <RHFForm schema={schema} defaultValues={defaultValues} onSubmit={onSubmit}>
      <RHFInput name="amount" type="number" label={translate('Amount')} />
      <RHFInput name="description" label={translate('Description')} />
      <RHFSelect name="category" label={translate('expense_category')} options={options} />
      <button type="submit">{translate('save')}</button>
    </RHFForm>
  );
}
