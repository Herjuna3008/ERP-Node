import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input, Button } from 'antd';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().nonnegative(),
});

const ProductForm = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', price: 0 },
  });

  const submit = (data) => {
    if (onSubmit) onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div>
        <Input placeholder="Name" {...register('name')} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      <div>
        <Input type="number" placeholder="Price" {...register('price', { valueAsNumber: true })} />
        {errors.price && <p>{errors.price.message}</p>}
      </div>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </form>
  );
};

export default ProductForm;
