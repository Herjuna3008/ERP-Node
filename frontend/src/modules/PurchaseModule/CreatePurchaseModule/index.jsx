import PurchaseForm from '../PurchaseForm';

const CreatePurchaseModule = () => {
  const handleSubmit = async (data) => {
    try {
      await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return <PurchaseForm onSubmit={handleSubmit} />;
};

export default CreatePurchaseModule;
