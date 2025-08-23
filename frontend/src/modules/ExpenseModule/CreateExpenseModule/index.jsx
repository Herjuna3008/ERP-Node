import ExpenseForm from '../ExpenseForm';

const CreateExpenseModule = () => {
  const handleSubmit = async (data) => {
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  return <ExpenseForm onSubmit={handleSubmit} />;
};

export default CreateExpenseModule;
