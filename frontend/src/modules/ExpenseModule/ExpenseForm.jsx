import { z } from 'zod';
import RHFForm from '@/forms/RHFForm';
import RHFInput from '@/forms/RHFInput';

const schema = z.object({
  amount: z.number().min(0, 'Amount is required'),
  description: z.string().min(1, 'Description is required'),
});

export default function ExpenseForm({ onSubmit }) {
  const defaultValues = { amount: 0, description: '' };

  return (
    <RHFForm schema={schema} defaultValues={defaultValues} onSubmit={onSubmit}>
      <RHFInput name="amount" type="number" label="Amount" />
      <RHFInput name="description" label="Description" />
      <button type="submit">Save Expense</button>
    </RHFForm>
  );
}
