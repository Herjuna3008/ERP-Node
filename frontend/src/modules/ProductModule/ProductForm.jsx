import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input, Button } from 'antd';

const { TextArea } = Input;

const schema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative(),
  averageCost: z.number().nonnegative(),
  description: z.string().optional(),
});

const ProductForm = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: '',
      name: '',
      price: 0,
      stock: 0,
      minStock: 0,
      averageCost: 0,
      description: '',
    },
  });

  const submit = (data) => {
    if (onSubmit) onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div>
        <Input placeholder="SKU" {...register('sku')} />
        {errors.sku && <p>{errors.sku.message}</p>}
      </div>
      <div>
        <Input placeholder="Name" {...register('name')} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      <div>
        <Input type="number" placeholder="Price" {...register('price', { valueAsNumber: true })} />
        {errors.price && <p>{errors.price.message}</p>}
      </div>
      <div>
        <Input type="number" placeholder="Stock" {...register('stock', { valueAsNumber: true })} />
        {errors.stock && <p>{errors.stock.message}</p>}
      </div>
      <div>
        <Input type="number" placeholder="Min Stock" {...register('minStock', { valueAsNumber: true })} />
        {errors.minStock && <p>{errors.minStock.message}</p>}
      </div>
      <div>
        <Input type="number" placeholder="Average Cost" {...register('averageCost', { valueAsNumber: true })} />
        {errors.averageCost && <p>{errors.averageCost.message}</p>}
      </div>
      <div>
        <TextArea rows={4} placeholder="Description" {...register('description')} />
        {errors.description && <p>{errors.description.message}</p>}
      </div>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </form>
  );
};

export default ProductForm;
