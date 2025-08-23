import React from 'react';
import PurchaseForm from './PurchaseForm';

const PurchaseModule = () => {
  const handleSubmit = async (data) => {
    try {
      await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [data] }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return <PurchaseForm onSubmit={handleSubmit} />;
};

export default PurchaseModule;
