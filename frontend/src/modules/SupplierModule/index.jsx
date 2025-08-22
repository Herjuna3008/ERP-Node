import React from 'react';
import SupplierForm from './SupplierForm';

const SupplierModule = () => {
  const handleSubmit = (data) => {
    console.log('Supplier submit', data);
  };

  return <SupplierForm onSubmit={handleSubmit} />;
};

export default SupplierModule;
