import PayrollForm from '../PayrollForm';

const CreatePayrollModule = () => {
  const handleSubmit = async (data) => {
    await fetch('/api/payroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  return <PayrollForm onSubmit={handleSubmit} />;
};

export default CreatePayrollModule;
