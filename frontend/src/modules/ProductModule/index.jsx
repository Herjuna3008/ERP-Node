import React from 'react';
import ProductForm from './ProductForm';

const ProductModule = () => {
  const handleSubmit = (data) => {
    console.log('Product submit', data);
  };

  return <ProductForm onSubmit={handleSubmit} />;
};

export default ProductModule;
